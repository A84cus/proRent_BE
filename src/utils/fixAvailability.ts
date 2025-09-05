// scripts/fixAvailability.ts
import prisma from '../prisma';
import { getRoomTypeTotalQuantity } from '../service/reservationService/availabilityService';

async function fixAvailability () {
   const availabilities = await prisma.availability.findMany();

   for (const avail of availabilities) {
      const totalQuantity = await getRoomTypeTotalQuantity(avail.roomTypeId);
      if (avail.availableCount > totalQuantity) {
         console.log(`Fixing: ${avail.id} | ${avail.date} | ${avail.availableCount} → ${totalQuantity}`);
         await prisma.availability.update({
            where: { id: avail.id },
            data: { availableCount: totalQuantity }
         });
      }
   }

   console.log('Availability fix complete.');
}

fixAvailability().catch(console.error);
