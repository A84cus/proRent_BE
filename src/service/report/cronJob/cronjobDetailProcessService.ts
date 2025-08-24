// src/service/report/cronJob/cronjobDetailProcessService.ts
import { FinalizedPeriodParams } from '../../../interfaces/report/reportDashboardInterface';
import prisma from '../../../prisma';
import { recalculatePropertySummaryForPeriod } from '../cronJobMainService';
import { validateRoomTypeOwnership } from '../reportByTimeHelperService';
import { upsertRoomTypePerformanceSummary } from '../roomTypeSummaryService';
import { aggregateRoomTypeReservationData, fetchRoomTypeUniqueUsers } from './cronjobAggregationService';
import { getPeriodDateRange } from './cronjobDateService';

export async function recalculateRoomTypeSummaryForPeriod (
   ownerId: string, // For validation
   roomTypeId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month?: number | null,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   await validateRoomTypeOwnership(ownerId, roomTypeId); // Ensure room type belongs to owner's property
   const { startDate, endDate } = getPeriodDateRange(periodType, periodKey);

   // Use specific aggregation functions for RoomType
   const { totalRevenue, totalReservations, totalNightsBooked } = await aggregateRoomTypeReservationData(
      roomTypeId,
      startDate,
      endDate
   );

   if (totalReservations === 0) {
      console.log(`Skipping summary for Property ${roomTypeId} (${periodType} ${periodKey}) - No reservations.`);
      return; // Exit early, DO NOT call upsertPropertyPerformanceSummary
   }

   const uniqueUsers = await fetchRoomTypeUniqueUsers(roomTypeId, startDate, endDate); // Specific unique user fetch

   // Fetch propertyId for denormalization in the summary table
   const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { propertyId: true }
   });
   if (!roomType) {
      throw new Error(`RoomType with ID ${roomTypeId} not found after validation.`);
   }

   await upsertRoomTypePerformanceSummary({
      roomTypeId,
      propertyId: roomType.propertyId, // Denormalized propertyId
      periodType,
      periodKey,
      year,
      month,
      totalRevenue,
      totalReservations,
      totalNightsBooked, // Include RoomType specific metric
      uniqueUsers,
      OwnerId: ownerId
   });
}

// --- Updated Owner-Level Calculation ---
export async function recalculateOwnerSummariesForPeriod ( // Renamed for clarity
   ownerId: string,
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   const properties = await prisma.property.findMany({
      where: { OwnerId: ownerId },
      select: { id: true }
   });

   if (properties.length === 0) {
      console.log(`No properties found for owner ${ownerId}. Skipping recalculation.`);
      return;
   }

   // --- Process Properties ---
   await processPropertiesBatch(
      ownerId,
      properties,
      periodType,
      periodKey,
      year,
      month,
      isCurrentYearCalculation,
      previousMonthKey
   );

   // --- Process RoomTypes for all Properties ---
   // We can either iterate through properties again or fetch all room types directly.
   // Fetching directly might be slightly more efficient.
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

   if (roomTypes.length > 0) {
      await processRoomTypesBatch(
         ownerId,
         roomTypes,
         periodType,
         periodKey,
         year,
         month,
         isCurrentYearCalculation,
         previousMonthKey
      );
   }
}

// --- Property Batch Processing (Extracted/Kept) ---
async function processPropertiesBatch (
   ownerId: string,
   properties: { id: string }[],
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   const promises = properties.map(prop =>
      recalculatePropertySummaryForPeriod(
         ownerId,
         prop.id,
         periodType,
         periodKey,
         year,
         month,
         isCurrentYearCalculation,
         previousMonthKey
      )
         .then(() => ({ status: 'fulfilled', propertyId: prop.id })) // Return propertyId on success
         .catch(err => {
            console.error(`Error recalculating property summary for ${prop.id} (owner ${ownerId}):`, err);
            return { status: 'rejected', propertyId: prop.id, reason: err }; // Return propertyId and error on failure
         })
   );

   const results = await Promise.allSettled(promises); // Changed to allSettled for individual result handling if needed later
   // Basic logging as before, or enhance based on individual results if needed
   const successful = results.filter(r => r.status === 'fulfilled').length;
   const failed = results.filter(r => r.status === 'rejected').length;
   console.log(`Property recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`);
}

// --- New RoomType Batch Processing ---
async function processRoomTypesBatch (
   ownerId: string,
   roomTypes: { id: string }[],
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null = null,
   isCurrentYearCalculation?: boolean,
   previousMonthKey?: string
): Promise<void> {
   const promises = roomTypes.map(rt =>
      recalculateRoomTypeSummaryForPeriod(
         ownerId,
         rt.id,
         periodType,
         periodKey,
         year,
         month,
         isCurrentYearCalculation,
         previousMonthKey
      )
         .then(() => ({ status: 'fulfilled', roomTypeId: rt.id }))
         .catch(err => {
            console.error(`Error recalculating room type summary for ${rt.id} (owner ${ownerId}):`, err);
            return { status: 'rejected', roomTypeId: rt.id, reason: err };
         })
   );

   const results = await Promise.allSettled(promises);
   const successful = results.filter(r => r.status === 'fulfilled').length;
   const failed = results.filter(r => r.status === 'rejected').length;
   console.log(`RoomType recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`);
}
