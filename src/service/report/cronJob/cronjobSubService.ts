import prisma from '../../../prisma';
import { recalculateOwnerSummariesForPeriod } from './cronjobDetailProcessService';
import { findPendingJobs, createBatchJob, updateBatchJob } from './cronjobTrackingService';
import { JobStatus } from '@prisma/client';
import { getPeriodDateRange } from './cronjobDateService';

const RECENT_JOB_WINDOW_MINUTES = 10;

export async function smartYearlyRecalculation (year?: number): Promise<string> {
   const targetYear = year ?? new Date().getFullYear();
   const isCurrentYear = targetYear === new Date().getFullYear();
   const now = new Date();

   console.log(`Smart yearly recalculation initiated for year ${targetYear}. Is current year: ${isCurrentYear}.`);

   // --- 1. Resume any pending or failed jobs ---
   const pendingJobs = await findPendingJobs('RECALCULATE_ALL_OWNER_SUMMARIES', 10);
   if (pendingJobs.length > 0) {
      console.warn(`Found ${pendingJobs.length} pending jobs. Resuming processing...`);
      for (const job of pendingJobs) {
         console.log(`Resuming background processing for job ${job.id} (Status: ${job.status})`);
         // In a real system, you'd re-queue this job
         // For now, we assume the worker will pick it up
      }
      return `resumed-${pendingJobs.map(j => j.id).join(',')}`;
   }

   // --- 2. Prevent duplicate global job for this year ---
   const existingRunningJob = await prisma.batchJob.findFirst({
      where: {
         jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
         targetPeriodType: 'YEAR',
         targetPeriodKey: `${targetYear}`,
         status: {
            in: [ JobStatus.PENDING, JobStatus.IN_PROGRESS ]
         }
      }
   });

   if (existingRunningJob) {
      console.log(`A global job for YEAR ${targetYear} is already running (ID: ${existingRunningJob.id}). Skipping.`);
      return existingRunningJob.id;
   }

   const cutoffTime = new Date(now.getTime() - RECENT_JOB_WINDOW_MINUTES * 60 * 1000);
   const recentCompletedJob = await prisma.batchJob.findFirst({
      where: {
         jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
         targetPeriodType: 'YEAR',
         targetPeriodKey: `${targetYear}`,
         status: JobStatus.COMPLETED,
         completedAt: { gte: cutoffTime }
      },
      orderBy: { completedAt: 'desc' }
   });

   if (recentCompletedJob) {
      console.log(
         `A successful job for YEAR ${targetYear} completed at ${recentCompletedJob?.completedAt?.toISOString()}. ` +
            `Within ${RECENT_JOB_WINDOW_MINUTES}min window. Skipping redundant execution.`
      );
      return recentCompletedJob.id; // Return existing job ID
   }

   // --- 3. Create main orchestrator job ---
   const mainJob = await createBatchJob({
      jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
      targetPeriodType: 'YEAR',
      targetPeriodKey: `${targetYear}`,
      metadata: {
         year: targetYear,
         isCurrentYear,
         phase: 'SMART_YEARLY_ORCHESTRATION',
         totalOwnersProcessed: 0,
         failedOwnerIds: [],
         description: 'Orchestrates monthly gap-filling and final yearly recalculation'
      }
   });

   console.log(`Smart yearly recalculation started for ${targetYear}. Orchestrator Job ID: ${mainJob.id}`);

   // --- 4. Get all owners ---
   const owners = await prisma.user.findMany({
      where: { role: 'OWNER' },
      select: { id: true }
   });

   let totalProcessed = 0;
   const failedOwnerIds: string[] = [];

   for (const owner of owners) {
      try {
         if (isCurrentYear) {
            await handleCurrentYear(owner.id, targetYear, now);
         } else {
            await handlePastYear(owner.id, targetYear);
         }
         totalProcessed++;
      } catch (error) {
         console.error(`Error processing owner ${owner.id} for year ${targetYear}:`, error);
         failedOwnerIds.push(owner.id);
      }
   }

   // --- 5. Finalize orchestrator job ---
   await updateBatchJob({
      jobId: mainJob.id,
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
      metadata: {
         year: targetYear,
         totalOwnersProcessed: totalProcessed,
         failedOwnerIds,
         phase: 'COMPLETED',
         description: 'Smart yearly orchestration completed'
      }
   });

   console.log(
      `Smart yearly recalculation completed for ${targetYear}. Processed: ${totalProcessed}, Failed: ${failedOwnerIds.length}`
   );
   return mainJob.id;
}

// --- For past years: recalculate all 12 months + year ---
async function handlePastYear (ownerId: string, year: number): Promise<void> {
   console.log(`Handling past year ${year} for owner ${ownerId}`);
   for (let month = 1; month <= 12; month++) {
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;
      console.log(`Processing month ${periodKey} for owner ${ownerId} (Past Year)`);

      await recalculateOwnerSummariesForPeriod(ownerId, 'MONTH', periodKey, year, month);
   }
   // Finally, recalculate the yearly summary
   await recalculateOwnerSummariesForPeriod(ownerId, 'YEAR', `${year}`, year, null);
}

// --- For current year: detect and fill missing months ---
async function handleCurrentYear (ownerId: string, year: number, now: Date): Promise<void> {
   const currentMonth = now.getMonth(); // 0-indexed (Jan = 0)
   const missingMonths: number[] = [];

   console.log(
      `Checking missing monthly summaries for owner ${ownerId}, year ${year} (up to month ${currentMonth + 1})`
   );

   for (let month = 1; month <= currentMonth; month++) {
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;
      const exists = await prisma.propertyPerformanceSummary.findFirst({
         where: {
            periodType: 'MONTH',
            periodKey,
            property: { OwnerId: ownerId }
         },
         select: { id: true }
      });

      if (!exists) {
         missingMonths.push(month);
      }
   }

   if (missingMonths.length === 0) {
      console.log(`Owner ${ownerId}: All months from Jan to ${currentMonth} already have summaries.`);
   } else {
      const validMissingMonths = await filterMonthsWithReservations(ownerId, year, missingMonths);
      if (validMissingMonths.length === 0) {
         console.log(`Owner ${ownerId}: Missing months have no reservation data.`);
      } else {
         console.log(`Owner ${ownerId}: Recalculating missing months:`, validMissingMonths);
         for (const month of validMissingMonths) {
            const periodKey = `${year}-${String(month).padStart(2, '0')}`;
            await recalculateOwnerSummariesForPeriod(ownerId, 'MONTH', periodKey, year, month);
         }
      }
   }

   // Always recompute the YEAR summary after ensuring monthly data is up to date
   await recalculateOwnerSummariesForPeriod(ownerId, 'YEAR', `${year}`, year, null);
}

// --- Helper: check if a month has CONFIRMED reservations ---
async function filterMonthsWithReservations (ownerId: string, year: number, months: number[]): Promise<number[]> {
   const properties = await prisma.property.findMany({
      where: { OwnerId: ownerId },
      select: { id: true }
   });

   const propertyIds = properties.map(p => p.id);
   if (propertyIds.length === 0) {
      console.log(`Owner ${ownerId}: No properties found. Skipping month validation.`);
      return [];
   }

   const validMonths: number[] = [];
   for (const month of months) {
      const { startDate, endDate } = getPeriodDateRange('MONTH', `${year}-${String(month).padStart(2, '0')}`);

      const count = await prisma.reservation.count({
         where: {
            propertyId: { in: propertyIds },
            orderStatus: 'CONFIRMED',
            startDate: { lte: endDate },
            endDate: { gte: startDate }
         }
      });

      if (count > 0) {
         validMonths.push(month);
         console.log(`Month ${month} for owner ${ownerId} has ${count} CONFIRMED reservations. Will recalculate.`);
      } else {
         console.log(`Month ${month} for owner ${ownerId} has no reservations. Skipping.`);
      }
   }

   return validMonths;
}
