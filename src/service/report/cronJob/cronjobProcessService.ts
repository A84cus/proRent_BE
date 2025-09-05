// services/report/cronjobProcessService.ts
import { createBatchJob, updateBatchJob } from './cronjobTrackingService';
import prisma from '../../../prisma';
import { JobStatus, Prisma } from '@prisma/client';
import { recalculateAllOwnersPropertiesSummaryForPeriod } from '../cronJobMainService';
import { recalculateOwnerSummariesForPeriod, recalculateRoomTypeSummaryForPeriod } from './cronjobDetailProcessService';

export async function processOwnerBatch (
   ownersBatch: { id: string }[],
   mainJobId: string,
   periodType: string,
   periodKey: string, // This IS a string (e.g., "2023-10", "2023")
   year: number,
   month: number | null = null, // This can be null
   failedOwnerIds: string[],
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   const ownerJobPromises = ownersBatch.map(async owner => {
      const ownerJob = await createBatchJob({
         jobType: 'RECALCULATE_OWNER_SUMMARIES',
         targetOwnerId: owner.id,
         targetPeriodType: periodType,
         targetPeriodKey: periodKey,
         metadata: { year, month, mainJobId, owner: owner.id, isCurrentYearCalculation, previousMonthKey } // Include owner ID in metadata
      });

      try {
         await recalculateOwnerSummariesForPeriod(
            owner.id,
            periodType,
            periodKey,
            year,
            month,
            isCurrentYearCalculation,
            previousMonthKey
         );

         await updateBatchJob({ jobId: ownerJob.id, status: JobStatus.COMPLETED, completedAt: new Date() });
      } catch (err: any) {
         console.error(`Error recalculating ALL summaries for owner ${owner.id} (Sub-Job ID: ${ownerJob.id}):`, err);
         failedOwnerIds.push(owner.id);
         await updateBatchJob({
            jobId: ownerJob.id,
            status: JobStatus.FAILED,
            errorMessage: err.message,
            completedAt: new Date()
         });
      }
   });

   await Promise.allSettled(ownerJobPromises);
}

export async function updateMainJobMetadata (
   jobId: string,
   totalProcessedOwners: number,
   totalBatchesCompleted: number,
   failedOwnerIds: string[]
): Promise<void> {
   const currentMainJob = await prisma.batchJob.findUnique({ where: { id: jobId } });
   if (!currentMainJob) {
      console.warn(`Main job ${jobId} not found during progress update.`);
      return;
   }

   await updateBatchJob({
      jobId,
      metadata: {
         ...(currentMainJob.metadata as Prisma.JsonObject),
         totalOwnersProcessed: totalProcessedOwners,
         totalBatchesCompleted,
         failedOwnerIds: [ ...((currentMainJob.metadata as any)?.failedOwnerIds || []), ...failedOwnerIds ]
      } as Prisma.JsonValue
   });
}

export async function finalizeMainJob (
   jobId: string,
   totalProcessedOwners: number,
   totalBatchesCompleted: number,
   failedOwnerIds: string[],
   errorMessage: string | null = null
): Promise<void> {
   const finalStatus = failedOwnerIds.length > 0 ? JobStatus.FAILED : JobStatus.COMPLETED;
   const finalMainJob = await prisma.batchJob.findUnique({ where: { id: jobId } });

   await updateBatchJob({
      jobId,
      status: finalStatus,
      completedAt: new Date(),
      errorMessage,
      metadata: {
         ...(finalMainJob?.metadata as Prisma.JsonObject),
         totalOwnersProcessed: totalProcessedOwners,
         totalBatchesCompleted,
         failedOwnerIds
      } as Prisma.JsonValue
   });
}

export async function processOwnerRoomTypeBatch (
   ownerId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   failedOwnerIds: string[]
): Promise<void> {
   try {
      const properties = await prisma.property.findMany({
         where: { OwnerId: ownerId },
         select: { id: true }
      });

      if (properties.length === 0) {
         return;
      }

      const roomTypes = await prisma.roomType.findMany({
         where: {
            propertyId: {
               in: properties.map(p => p.id)
            }
         },
         select: {
            id: true
         }
      });

      if (roomTypes.length === 0) {
         return;
      }

      const roomTypePromises = roomTypes.map(rt =>
         recalculateRoomTypeSummaryForPeriod(ownerId, rt.id, periodType, periodKey, year, month)
            .then(() => ({ status: 'fulfilled', roomTypeId: rt.id }))
            .catch(err => {
               console.error(`Error recalculating RoomType summary ${rt.id} for owner ${ownerId}:`, err);
               return { status: 'rejected', roomTypeId: rt.id, reason: err };
            })
      );
   } catch (error: any) {
      console.error(`Critical error during RoomType batch processing for owner ${ownerId}:`, error);
      failedOwnerIds.push(ownerId);
   }
}
