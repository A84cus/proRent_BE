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

   const pendingJobs = await findPendingJobs('RECALCULATE_ALL_OWNER_SUMMARIES', 10);
   if (pendingJobs.length > 0) {
      console.warn(`Found ${pendingJobs.length} pending jobs. Resuming processing...`);
      return `resumed-${pendingJobs.map(j => j.id).join(',')}`;
   }

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
      return recentCompletedJob.id;
   }

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

   return mainJob.id;
}

async function handlePastYear (ownerId: string, year: number): Promise<void> {
   for (let month = 1; month <= 12; month++) {
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;
      await recalculateOwnerSummariesForPeriod(ownerId, 'MONTH', periodKey, year, month);
   }
   await recalculateOwnerSummariesForPeriod(ownerId, 'YEAR', `${year}`, year, null);
}

async function handleCurrentYear (ownerId: string, year: number, now: Date): Promise<void> {
   const currentMonth = now.getMonth(); // 0-indexed (Jan = 0)
   const missingMonths: number[] = [];

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
   } else {
      const validMissingMonths = await filterMonthsWithReservations(ownerId, year, missingMonths);
      if (validMissingMonths.length === 0) {
      } else {
         for (const month of validMissingMonths) {
            const periodKey = `${year}-${String(month).padStart(2, '0')}`;
            await recalculateOwnerSummariesForPeriod(ownerId, 'MONTH', periodKey, year, month);
         }
      }
   }

   await recalculateOwnerSummariesForPeriod(ownerId, 'YEAR', `${year}`, year, null);
}

async function filterMonthsWithReservations (ownerId: string, year: number, months: number[]): Promise<number[]> {
   const properties = await prisma.property.findMany({
      where: { OwnerId: ownerId },
      select: { id: true }
   });

   const propertyIds = properties.map(p => p.id);
   if (propertyIds.length === 0) {
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
      }
   }

   return validMonths;
}
