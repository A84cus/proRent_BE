// src/services/report/cronJob/prewarmDashboardReports.ts

import { createBatchJob, isJobRunningForPeriod, updateBatchJob } from './cronjobTrackingService';
import { processOwnerBatch, finalizeMainJob, updateMainJobMetadata } from './cronjobProcessService';
import { JobStatus } from '@prisma/client';
import prisma from '../../../prisma';
import { getOwnerDashboardReport } from '../reportDashboardService';
import { validateFinalPeriodParams, getDefaultPeriodParams } from './cronjobHelperService';
import { FinalizedPeriodParams } from '../../../interfaces/report/reportDashboardInterface';

// --- Main Entry Point ---
export async function prewarmDashboardReports (
   periodType?: string,
   periodKey?: string,
   year?: number,
   month: number | null = null,
   batchSize: number = 5,
   delayMs: number = 1000
): Promise<string> {
   const finalizedParams = await determinePeriodParameters(periodType, periodKey, year, month);
   const { periodType: pType, periodKey: pKey } = finalizedParams;

   if (await isJobRunningForPeriod(pType, pKey)) {
      throw new Error(`A job is already running for ${pType} ${pKey}. Skipping.`);
   }

   await validateParameters(finalizedParams, batchSize, delayMs);

   const mainJob = await createMainBatchJob(finalizedParams, batchSize, delayMs);
   initiateBackgroundProcessing(mainJob.id, finalizedParams, batchSize, delayMs);

   return mainJob.id;
}

// --- Determine Period ---
async function determinePeriodParameters (
   periodType: string | undefined,
   periodKey: string | undefined,
   year: number | undefined,
   month: number | null | undefined
): Promise<FinalizedPeriodParams> {
   return getDefaultPeriodParams(periodType, periodKey, year, month);
}

// --- Validate Parameters ---
async function validateParameters (params: FinalizedPeriodParams, batchSize: number, delayMs: number): Promise<void> {
   validateFinalPeriodParams(params);
}

// --- Create Main Job ---
async function createMainBatchJob (params: FinalizedPeriodParams, batchSize: number, delayMs: number) {
   console.log(`Creating pre-warm job for ${params.periodType} ${params.periodKey}`);
   return await createBatchJob({
      jobType: 'PREWARM_DASHBOARD_REPORTS',
      targetPeriodType: params.periodType,
      targetPeriodKey: params.periodKey,
      metadata: {
         periodType: params.periodType,
         periodKey: params.periodKey,
         year: params.year,
         month: params.month,
         batchSize,
         delayMs,
         totalOwnersProcessed: 0,
         totalBatchesCompleted: 0,
         failedOwnerIds: [] as string[]
      }
   });
}

// --- Initiate Background Processing ---
export function initiateBackgroundProcessing (
   jobId: string,
   params: FinalizedPeriodParams,
   batchSize: number,
   delayMs: number
): void {
   console.log(`Initiating pre-warm background processing for job ${jobId}`);
   processAllOwnersInBackground(jobId, params, batchSize, delayMs).catch(err => handleBackgroundError(jobId, err));
}

// --- Handle Background Error ---
async function handleBackgroundError (jobId: string, error: any): Promise<void> {
   console.error(`Critical error in pre-warm job ${jobId}:`, error);
   try {
      await updateBatchJob({
         jobId,
         status: JobStatus.FAILED,
         errorMessage: `Critical error: ${error.message}`,
         completedAt: new Date()
      });
   } catch (updateError) {
      console.error(`Failed to update pre-warm job ${jobId} to FAILED:`, updateError);
   }
}

// --- Background Processing Logic ---
async function processAllOwnersInBackground (
   mainJobId: string,
   params: FinalizedPeriodParams,
   batchSize: number,
   delayMs: number
) {
   let skip = 0;
   const limit = batchSize;
   let hasMore = true;
   let totalProcessedOwners = 0;
   let totalBatchesCompleted = 0;
   const failedOwnerIds: string[] = [];

   try {
      await updateBatchJob({ jobId: mainJobId, status: JobStatus.IN_PROGRESS, startedAt: new Date() });
      console.log(`Started pre-warm job ${mainJobId}`);

      while (hasMore) {
         const ownersBatch = await prisma.user.findMany({
            where: { role: 'OWNER' },
            select: { id: true },
            orderBy: { id: 'asc' },
            skip,
            take: limit
         });

         if (ownersBatch.length === 0) {
            hasMore = false;
            break;
         }

         // Process batch
         await processOwnerBatchWithDashboardPrewarm(
            ownersBatch,
            mainJobId,
            params.periodType,
            params.periodKey,
            params.year,
            params.month
         );

         totalProcessedOwners += ownersBatch.length;
         totalBatchesCompleted += 1;

         await updateMainJobMetadata(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds);

         if (ownersBatch.length < limit) {
            hasMore = false;
         } else {
            skip += limit;
         }

         if (hasMore && delayMs > 0) {
            console.log(`Waiting ${delayMs}ms before next batch (Job ID: ${mainJobId})...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
         }
      }

      await finalizeMainJob(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds);
   } catch (error: any) {
      console.error(`Unexpected error in pre-warm job ${mainJobId}:`, error);
      await finalizeMainJob(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds, error.message);
   }
}

// --- Process One Owner: Trigger Dashboard Report ---
async function processOwnerBatchWithDashboardPrewarm (
   owners: { id: string }[],
   mainJobId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null
) {
   const now = new Date();
   const currentYear = now.getFullYear();
   const currentMonth = now.getMonth() + 1; // JS months are 0-indexed

   // Skip if this is the current month
   if (periodType === 'MONTH' && year === currentYear && month === currentMonth) {
      console.log(`Skipping pre-warm for current month ${year}-${month}`);
      return;
   }

   // Skip if this is the current year and period is YEAR
   if (periodType === 'YEAR' && year === currentYear) {
      console.log(`Skipping pre-warm for current year ${year}`);
      return;
   }

   // Determine startDate/endDate from period
   const { startDate, endDate } = getPeriodRange(periodType, year, month);

   for (const owner of owners) {
      try {
         // --- 🔥 Trigger dashboard report → auto-caches ---
         await getOwnerDashboardReport(owner.id, {
            startDate,
            endDate
         });
         console.log(`✅ Pre-warmed dashboard for Owner ${owner.id} - ${periodType} ${periodKey}`);
      } catch (error: any) {
         console.error(`❌ Failed to pre-warm dashboard for Owner ${owner.id}:`, error.message);
      }
   }
}

// --- Helper: Get Date Range from Period ---
function getPeriodRange (periodType: string, year: number, month: number | null) {
   const start = new Date(Date.UTC(year, 0, 1)); // Jan 1
   const end = new Date(Date.UTC(year, 11, 31)); // Dec 31

   if (periodType === 'MONTH' && month !== null) {
      const monthStart = new Date(Date.UTC(year, month - 1, 1));
      const monthEnd = new Date(Date.UTC(year, month, 0)); // Last day
      return { startDate: monthStart, endDate: monthEnd };
   }

   return { startDate: start, endDate: end };
}
