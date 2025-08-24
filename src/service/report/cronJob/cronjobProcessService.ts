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
   console.log(`Processing batch of ${ownersBatch.length} owners for summaries (Job ID: ${mainJobId})`);
   console.log(`  Context: ${periodType} ${periodKey} (Year: ${year}, Month: ${month})`);
   console.log(`  Current Year Mode: ${isCurrentYearCalculation}, Previous Month Key: ${previousMonthKey}`);

   const ownerJobPromises = ownersBatch.map(async owner => {
      // --- Create a sub-job for the specific owner's calculations ---
      const ownerJob = await createBatchJob({
         jobType: 'RECALCULATE_OWNER_SUMMARIES', // Updated job type for combined work
         targetOwnerId: owner.id,
         targetPeriodType: periodType,
         targetPeriodKey: periodKey,
         metadata: { year, month, mainJobId, owner: owner.id, isCurrentYearCalculation, previousMonthKey } // Include owner ID in metadata
      });

      try {
         // --- Call the function that processes ONE owner ---
         // This function should internally handle both Property and RoomType calculations for this owner.
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
         console.log(
            `Successfully recalculated ALL summaries (Property & RoomType) for owner ${owner.id} (Sub-Job ID: ${ownerJob.id})`
         );
      } catch (err: any) {
         console.error(`Error recalculating ALL summaries for owner ${owner.id} (Sub-Job ID: ${ownerJob.id}):`, err);
         failedOwnerIds.push(owner.id);
         await updateBatchJob({
            jobId: ownerJob.id,
            status: JobStatus.FAILED,
            errorMessage: err.message,
            completedAt: new Date()
         });
         // Don't re-throw here, let other owners in the batch continue
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

   console.log(
      `Global recalculation job ${jobId} completed. Status: ${finalStatus}, Processed: ${totalProcessedOwners}, Failed: ${failedOwnerIds.length}`
   );
}

export async function processOwnerRoomTypeBatch (
   ownerId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   failedOwnerIds: string[] // Reference to accumulate failed owner IDs from the main process
): Promise<void> {
   console.log(`Starting RoomType summary recalculation for owner ${ownerId} (Period: ${periodType}:${periodKey})`);

   try {
      // --- 1. Fetch all properties for the owner ---
      const properties = await prisma.property.findMany({
         where: { OwnerId: ownerId },
         select: { id: true }
      });

      if (properties.length === 0) {
         console.log(`No properties found for owner ${ownerId} during RoomType recalculation. Skipping.`);
         return;
      }

      // --- 2. Fetch all RoomTypes for those properties ---
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
         console.log(`No room types found for owner ${ownerId}'s properties during RoomType recalculation. Skipping.`);
         return;
      }

      console.log(`Found ${roomTypes.length} room types for owner ${ownerId}. Starting calculations...`);

      // --- 3. Process Each RoomType ---
      const roomTypePromises = roomTypes.map(rt =>
         recalculateRoomTypeSummaryForPeriod(ownerId, rt.id, periodType, periodKey, year, month)
            .then(() => ({ status: 'fulfilled', roomTypeId: rt.id }))
            .catch(err => {
               console.error(`Error recalculating RoomType summary ${rt.id} for owner ${ownerId}:`, err);
               return { status: 'rejected', roomTypeId: rt.id, reason: err };
            })
      );

      // --- 4. Wait for all calculations ---
      const results = await Promise.allSettled(roomTypePromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // --- 5. Log Results ---
      // Note: We don't throw an error here to let the main process continue.
      // Failed owner tracking might need refinement based on whether *any* room type failing marks the owner as failed.
      console.log(
         `RoomType recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`
      );
      if (failed > 0) {
         // Optionally, decide if this constitutes an owner-level failure.
         // For now, we log it. You might push ownerId to failedOwnerIds here if desired.
         // failedOwnerIds.push(ownerId); // Uncomment if owner fails if any room type fails
         console.warn(`Owner ${ownerId} had ${failed} failed RoomType calculations.`);
      }
   } catch (error: any) {
      console.error(`Critical error during RoomType batch processing for owner ${ownerId}:`, error);
      // Marking the owner as failed due to a critical error in fetching room types or initiating calculations
      failedOwnerIds.push(ownerId);
      // Don't re-throw to keep the main batch processing loop alive
   }
}
