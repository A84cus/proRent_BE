// services/pricingService.ts
import prisma from '../../prisma';

export async function calculateTotalPrice (roomTypeId: string, startDate: Date, endDate: Date) {
   const roomTypes = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { peakRates: true }
   });

   if (!roomTypes) {
      throw new Error('RoomType not found');
   }

   let total = 0;
   const currentDate = new Date(startDate);

   while (currentDate < endDate) {
      total += await getDailyPrice(roomTypes, currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
   }

   return total;
}

async function getDailyPrice (roomType: any, date: Date) {
   const basePrice = Number(roomType.basePrice);
   const peakRate = roomType.peakRates.find((pr: any) => {
      const start = new Date(pr.startDate);
      const end = new Date(pr.endDate);
      return date >= start && date < end;
   });

   if (!peakRate) {
      return basePrice;
   }

   if (peakRate.rateType === 'FIXED') {
      return basePrice + Number(peakRate.value);
   } else if (peakRate.rateType === 'PERCENTAGE') {
      return basePrice * (1 + Number(peakRate.value) / 100);
   }
   return basePrice;
}
