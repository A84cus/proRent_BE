// src/service/report/cronJobMainService.ts
import { validatePropertyOwnership, validateRoomTypeOwnership } from './cronJob/cronjobValidationService'; // Import validateRoomTypeOwnership
import { getCurrentYearAndPreviousMonthInfo, getPeriodDateRange } from './cronJob/cronjobDateService';
import { aggregateReservationData, fetchUniqueUsers } from './cronJob/cronjobAggregationService'; // Import RoomType aggregation functions
import { upsertPropertyPerformanceSummary } from './PerformanceSummaryService'; // Import upsertRoomTypePerformanceSummary
import { createBatchJob, isJobRunningForPeriod, updateBatchJob } from './cronJob/cronjobTrackingService';
import prisma from '../../prisma';
import { JobStatus } from '@prisma/client';
import { finalizeMainJob, processOwnerBatch, updateMainJobMetadata } from './cronJob/cronjobProcessService'; // Import processOwnerRoomTypeBatch
import { FinalizedPeriodParams } from '../../interfaces/report/reportDashboardInterface';
import { getDefaultPeriodParams, validateFinalPeriodParams } from './cronJob/cronjobHelperService';

// --- Property Calculation ---
export async function recalculatePropertySummaryForPeriod (
   ownerId: string,
   propertyId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month?: number | null,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   await validatePropertyOwnership(ownerId, propertyId);
   const { startDate, endDate } = getPeriodDateRange(periodType, periodKey);
   const { totalRevenue, totalReservations } = await aggregateReservationData(propertyId, startDate, endDate);

   if (totalReservations === 0) {
      return;
   }
   const uniqueUsers = await fetchUniqueUsers(propertyId, startDate, endDate);

   const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { OwnerId: true }
   });

   if (!property) {
      throw new Error(`Property ${propertyId} not found.`);
   }

   await upsertPropertyPerformanceSummary({
      propertyId,
      periodType,
      periodKey,
      year,
      month,
      totalRevenue,
      totalReservations,
      uniqueUsers,
      OwnerId: property.OwnerId
   });
}

// --- Global Owner Processing (Remains largely the same, calls the updated owner function) ---
export async function recalculateAllOwnersPropertiesSummaryForPeriod (
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

   const { isCurrentYearCalculation, previousMonthKey } = getCurrentYearAndPreviousMonthInfo(
      finalizedParams.periodType,
      finalizedParams.periodKey,
      finalizedParams.year
   );

   const mainJob = await createMainBatchJob(
      finalizedParams,
      batchSize,
      delayMs,
      isCurrentYearCalculation,
      previousMonthKey ?? undefined
   );
   initiateBackgroundProcessing(mainJob.id, finalizedParams, batchSize, delayMs);

   return mainJob.id;
}

async function determinePeriodParameters (
   periodType: string | undefined,
   periodKey: string | undefined,
   year: number | undefined,
   month: number | null | undefined
): Promise<FinalizedPeriodParams> {
   // Delegate to helper service/function
   return getDefaultPeriodParams(periodType, periodKey, year, month);
}

/** Validates the finalized parameters and config. */
async function validateParameters (params: FinalizedPeriodParams, batchSize: number, delayMs: number): Promise<void> {
   validateFinalPeriodParams(params);
}

/** Creates the main tracking job record. */
async function createMainBatchJob (
   params: FinalizedPeriodParams,
   batchSize: number,
   delayMs: number,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<any> {
   return await createBatchJob({
      jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
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
         failedOwnerIds: [] as string[],
         isCurrentYearCalculation,
         previousMonthKey
      }
   });
}
/** Starts the asynchronous background processing task. */
export function initiateBackgroundProcessing (
   jobId: string,
   params: FinalizedPeriodParams,
   batchSize: number,
   delayMs: number,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): void {
   processAllOwnersInBackground(
      jobId,
      params.periodType,
      params.periodKey,
      params.year,
      params.month,
      batchSize,
      delayMs,
      isCurrentYearCalculation,
      previousMonthKey
   ).catch(err => handleBackgroundError(jobId, err));
}

/** Handles errors occurring in the background processing task. */
async function handleBackgroundError (jobId: string, error: any): Promise<void> {
   console.error(`Critical error in background processing for job ${jobId}:`, error);
   try {
      await updateBatchJob({
         jobId,
         status: JobStatus.FAILED,
         errorMessage: `Critical error: ${error.message}`,
         completedAt: new Date()
      });
   } catch (updateError) {
      console.error(`Failed to update job ${jobId} to FAILED status:`, updateError);
   }
}

// --- Background Processing Logic (Calls the updated owner function) ---
async function processAllOwnersInBackground (
   mainJobId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   batchSize: number,
   delayMs: number,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
) {
   let skip = 0;
   const limit = batchSize;
   let hasMore = true;
   let totalProcessedOwners = 0;
   let totalBatchesCompleted = 0;
   const failedOwnerIds: string[] = [];
   let lastError: string | null = null;

   try {
      await updateBatchJob({ jobId: mainJobId, status: JobStatus.IN_PROGRESS, startedAt: new Date() });

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
         // Updated Call: Process both Property and RoomType summaries for the owner batch
         await processOwnerBatch(
            ownersBatch,
            mainJobId,
            periodType,
            periodKey,
            year,
            month,
            failedOwnerIds,
            isCurrentYearCalculation,
            previousMonthKey
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
            await new Promise(resolve => setTimeout(resolve, delayMs));
         }
      }

      await finalizeMainJob(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds);
   } catch (error: any) {
      console.error(`Unexpected error during processing of main job ${mainJobId}:`, error);
      lastError = `Unexpected error: ${error.message}`;
      await finalizeMainJob(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds, lastError);
   }
}
