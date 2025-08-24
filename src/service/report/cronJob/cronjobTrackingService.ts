// services/report/cronjobTrackingService.ts
import prisma from '../../../prisma'; // Adjust path
import { JobStatus, BatchJob } from '@prisma/client'; // Adjust import if needed
import { Prisma } from '@prisma/client';
import { CreateBatchJobInput, UpdateBatchJobInput } from '../../../interfaces/report/reportDashboardInterface';
import { initiateBackgroundProcessing } from '../cronJobMainService';

// --- Service Functions ---
export async function createBatchJob (data: CreateBatchJobInput): Promise<BatchJob> {
   return await prisma.batchJob.create({
      data: {
         jobType: data.jobType,
         targetOwnerId: data.targetOwnerId ?? null,
         targetPeriodType: data.targetPeriodType ?? null,
         targetPeriodKey: data.targetPeriodKey ?? null,
         metadata: data.metadata ?? Prisma.JsonNull
      }
   });
}

export async function updateBatchJob (data: UpdateBatchJobInput): Promise<BatchJob> {
   const { jobId, ...updateFields } = data;

   // --- Key Fix: Prepare data for Prisma, explicitly handling null/undefined for Json fields ---
   const prismaUpdateData: Prisma.BatchJobUpdateInput = {};

   // Iterate through the fields and add them to prismaUpdateData only if they are not undefined
   // This avoids passing `undefined` which can cause typing issues with optional Json fields
   if (updateFields.status !== undefined) {
      prismaUpdateData.status = updateFields.status;
   }
   if (updateFields.startedAt !== undefined) {
      prismaUpdateData.startedAt = updateFields.startedAt;
   }
   if (updateFields.completedAt !== undefined) {
      prismaUpdateData.completedAt = updateFields.completedAt;
   }
   if (updateFields.errorMessage !== undefined) {
      prismaUpdateData.errorMessage = updateFields.errorMessage;
   }
   // Crucially, explicitly handle metadata being null or a value. undefined is skipped.
   if (updateFields.metadata !== undefined) {
      if (updateFields.metadata === null) {
         prismaUpdateData.metadata = Prisma.JsonNull;
      } else {
         prismaUpdateData.metadata = updateFields.metadata;
      }
   }

   return await prisma.batchJob.update({
      where: { id: jobId },
      data: prismaUpdateData // Use the explicitly typed data object
   });
}

export async function findPendingJobs (jobType?: string, limit: number = 10): Promise<BatchJob[]> {
   const whereClause: Prisma.BatchJobWhereInput = {
      status: JobStatus.PENDING
   };
   if (jobType) {
      whereClause.jobType = jobType;
   }

   return await prisma.batchJob.findMany({
      where: whereClause,
      orderBy: {
         createdAt: 'asc' // Process oldest pending jobs first
      },
      take: limit
   });
}

export async function findBatchJobById (jobId: string): Promise<BatchJob | null> {
   return await prisma.batchJob.findUnique({
      where: { id: jobId }
   });
}

export async function handleExistingJobs (): Promise<boolean> {
   const pendingJobs = await findPendingJobs('RECALCULATE_ALL_OWNER_SUMMARIES', 10);

   if (pendingJobs.length > 0) {
      console.log(`Found ${pendingJobs.length} pending jobs. Resuming...`);
      // Optionally: resume or re-queue them
      for (const job of pendingJobs) {
         console.log(`Re-initiating background processing for job ${job.id}`);
         if (typeof job.metadata === 'object' && job.metadata !== null) {
            const metadata = job.metadata as {
               year: number;
               month: number;
               batchSize: number;
               delayMs: number;
               isCurrentYearCalculation: boolean;
               previousMonthKey: string;
            };
            initiateBackgroundProcessing(
               job.id,
               {
                  periodType: job.targetPeriodType!,
                  periodKey: job.targetPeriodKey!,
                  year: metadata.year,
                  month: metadata.month
               },
               metadata.batchSize,
               metadata.delayMs,
               metadata.isCurrentYearCalculation,
               metadata.previousMonthKey
            );
         }
      }
      return true; // Indicate resumption, block new job
   }

   return false;
}

export async function isJobRunningForPeriod (periodType: string, periodKey: string): Promise<boolean> {
   const existingJob = await prisma.batchJob.findFirst({
      where: {
         jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
         targetPeriodType: periodType,
         targetPeriodKey: periodKey,
         status: {
            in: [ JobStatus.PENDING, JobStatus.IN_PROGRESS ]
         }
      }
   });
   return !!existingJob;
}
