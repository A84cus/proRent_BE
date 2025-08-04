// services/availabilityService.ts
import prisma from '../../prisma';

export async function checkAvailability (roomTypeId: string, startDate: Date, endDate: Date) {
   if (startDate >= endDate) {
      throw new Error('End date must be after start date');
   }

   const datesToCheck: Date[] = [];
   const currentDate = new Date(startDate);
   const endDateExclusive = new Date(endDate);

   while (currentDate < endDateExclusive) {
      datesToCheck.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
   }

   const availabilityRecords = await prisma.availability.findMany({
      where: {
         roomTypeId,
         date: { in: datesToCheck }
      },
      select: {
         date: true,
         availableCount: true
      }
   });

   const availabilityMap = new Map<string, number>();
   availabilityRecords.forEach(record => {
      availabilityMap.set(record.date.toISOString().split('T')[0], record.availableCount);
   });

   for (const date of datesToCheck) {
      const dateKey = date.toISOString().split('T')[0];

      if (availabilityMap.has(dateKey)) {
         if (availabilityMap.get(dateKey)! < 1) {
            return false;
         }
      }
   }

   return true;
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

export async function decrementAvailability (tx: any, roomTypeId: string, startDate: Date, endDate: Date) {
   const currentDate = new Date(startDate);
   const endDateExclusive = new Date(endDate);

   while (currentDate < endDateExclusive) {
      await tx.availability.update({
         where: {
            roomTypeId_date: {
               roomTypeId,
               date: new Date(currentDate)
            }
         },
         data: {
            availableCount: {
               decrement: 1
            }
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
