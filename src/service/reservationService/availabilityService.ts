// services/availabilityService.ts
import prisma from '../../prisma';

export async function checkAvailability (roomTypeId: string, startDate: Date, endDate: Date) {
   if (startDate >= endDate) {
      throw new Error('End date must be after start date');
   }

   const availabilityRecords = await prisma.availability.findMany({
      where: {
         roomTypeId,
         date: { lte: endDate, gte: startDate }
      },
      select: {
         date: true,
         availableCount: true
      }
   });

   const numberOfStays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
   if (availabilityRecords.length < numberOfStays) {
      console.warn(`Availability records for ${numberOfStays} days not found for room type ${roomTypeId}`);
      return false;
   }

   for (const record of availabilityRecords) {
      if (record.availableCount < 1) {
         return false;
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
               date: currentDate
            }
         },
         update: {},
         create: {
            roomTypeId,
            date: currentDate,
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
      await tx.availability.updateMany({
         where: {
            roomTypeId,
            date: { lte: endDate, gte: startDate }
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
