import prisma from '../../prisma';

export async function getUnavailableDates (roomTypeId: string, startDate?: Date, endDate?: Date) {
   const records = await prisma.availability.findMany({
      where: {
         roomTypeId,
         availableCount: 0,
         ...(startDate &&
            endDate && {
               date: {
                  gte: startDate,
                  lte: endDate // inclusive
               }
            })
      },
      select: {
         date: true
      },
      orderBy: { date: 'asc' }
   });

   return records.map(r => ({
      date: r.date.toISOString().split('T')[0], // YYYY-MM-DD
      isAvailable: false
   }));
}
