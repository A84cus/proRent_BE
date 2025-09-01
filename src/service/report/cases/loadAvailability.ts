// service/report/cases/loadAvailability.ts
import * as availabilityService from '../../reservationService/availabilityService';

export async function loadAvailability (roomTypeMap: Map<string, any>, reportStart?: Date, reportEnd?: Date) {
   await Promise.all(
      Array.from(roomTypeMap.keys()).map(async rtid => {
         const totalQuantity = await availabilityService.getRoomTypeTotalQuantity(rtid);
         const records = await availabilityService.getActualAvailabilityRecords(rtid, reportStart, reportEnd);
         const dates = records.map((r: any) => ({
            date: r.date.toISOString().split('T')[0],
            available: r.availableCount,
            isAvailable: r.availableCount > 0
         }));
         roomTypeMap.get(rtid)!.availability = { totalQuantity, dates };
      })
   );
}
