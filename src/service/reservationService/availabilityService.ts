// services/availabilityService.ts
import prisma from '../../prisma';

async function getRoomTypeTotalQuantity (roomTypeId: string): Promise<number> {
   const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { totalQuantity: true }
   });
   if (!roomType) {
      throw new Error(`RoomType with id ${roomTypeId} not found.`);
   }
   return roomType.totalQuantity;
}

function generateDateRange (startDate: Date, endDate: Date): Date[] {
   if (startDate >= endDate) {
      throw new Error('End date must be after start date');
   }

   const dates: Date[] = [];
   const current = new Date(startDate);
   const endExclusive = new Date(endDate);

   while (current < endExclusive) {
      dates.push(new Date(current)); // Push a copy
      current.setDate(current.getDate() + 1);
   }
   return dates;
}

async function getAvailabilityRecords (roomTypeId: string, datesToCheck: Date[]) {
   return await prisma.availability.findMany({
      where: {
         roomTypeId,
         date: { in: datesToCheck }
      },
      select: {
         date: true,
         availableCount: true
      }
   });
}

function buildAvailabilityMap (availabilityRecords: any[]) {
   const map = new Map<string, number>();
   availabilityRecords.forEach(record => {
      // Consider using date formatting utilities for consistency
      map.set(record.date.toISOString().split('T')[0], record.availableCount);
   });
   return map;
}

function isDateAvailable (date: Date, availabilityMap: Map<string, number>, totalQuantity: number): boolean {
   const dateKey = date.toISOString().split('T')[0];
   const availableCount = availabilityMap.has(dateKey) ? availabilityMap.get(dateKey)! : totalQuantity;

   return availableCount >= 1;
}

// --- Main Exported Functions ---

export async function checkAvailability (roomTypeId: string, startDate: Date, endDate: Date) {
   const totalQuantity = await getRoomTypeTotalQuantity(roomTypeId);
   const datesToCheck = generateDateRange(startDate, endDate);
   const availabilityRecords = await getAvailabilityRecords(roomTypeId, datesToCheck);
   const availabilityMap = buildAvailabilityMap(availabilityRecords);

   for (const date of datesToCheck) {
      if (!isDateAvailable(date, availabilityMap, totalQuantity)) {
         return false; // Fail fast if any date is unavailable
      }
   }

   return true; // All dates are available
}

export async function validateAvailabilityRecords (
   roomTypeId: string,
   startDate: Date,
   endDate: Date,
   totalQuantity: number
) {
   const currentDate = new Date(startDate);
   const endDateExclusive = new Date(endDate);

   while (currentDate < endDateExclusive) {
      await prisma.availability.upsert({
         where: {
            roomTypeId_date: {
               roomTypeId,
               date: new Date(currentDate)
            }
         },
         update: {},
         create: {
            roomTypeId,
            date: new Date(currentDate),
            availableCount: totalQuantity
         }
      });

      currentDate.setDate(currentDate.getDate() + 1);
   }
}

// Modified decrement function that ensures record existence
export async function DecrementAvailability (tx: any, roomTypeId: string, startDate: Date, endDate: Date) {
   const totalQuantity = await getRoomTypeTotalQuantity(roomTypeId);
   const currentDate = new Date(startDate);
   const endDateExclusive = new Date(endDate);

   while (currentDate < endDateExclusive) {
      const dateForQuery = new Date(currentDate);
      await tx.availability.upsert({
         where: {
            roomTypeId_date: {
               roomTypeId,
               date: dateForQuery
            }
         },
         update: {
            availableCount: {
               decrement: 1
            }
         },
         create: {
            roomTypeId,
            date: dateForQuery,
            availableCount: totalQuantity - 1
         }
      });

      currentDate.setDate(currentDate.getDate() + 1);
   }
}

export async function incrementAvailability (tx: any, roomTypeId: string, startDate: Date, endDate: Date) {
   const currentDate = new Date(startDate);
   const endDateExclusive = new Date(endDate);

   while (currentDate < endDateExclusive) {
      await tx.availability.update({
         where: {
            roomTypeId_date: {
               roomTypeId,
               date: currentDate
            }
         },
         data: {
            availableCount: {
               increment: 1
            }
         }
      });

      currentDate.setDate(currentDate.getDate() + 1);
   }
}
