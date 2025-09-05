// service/report/cases/loadAvailability.ts
import * as availabilityService from '../../reservationService/availabilityService';

export async function loadAvailability (roomTypeMap: Map<string, any>, reportStart?: Date, reportEnd?: Date) {
   for (const rtid of roomTypeMap.keys()) {
      try {
         const totalQuantity = await availabilityService.getRoomTypeTotalQuantity(rtid);
         const records = await availabilityService.getActualAvailabilityRecords(rtid, reportStart, reportEnd);
         const dates = records.map((r: any) => ({
            date: r.date.toISOString().split('T')[0],
            available: r.availableCount,
            isAvailable: r.availableCount > 0
         }));
         const roomTypeEntry = roomTypeMap.get(rtid);
         if (roomTypeEntry) {
            // Add safety check
            roomTypeEntry.availability = { totalQuantity, dates };
         }
      } catch (error) {
         console.error(`Error loading availability for room type ${rtid}:`, error);
         // Decide how to handle individual errors - maybe set default availability or log
         const roomTypeEntry = roomTypeMap.get(rtid);
         if (roomTypeEntry) {
            roomTypeEntry.availability = { totalQuantity: 0, dates: [] }; // Default
         }
      }
   }

   return roomTypeMap;
}
