// service/report/cases/globalSummary.ts
import prisma from '../../../prisma';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

const NOW = new Date();

export async function loadGlobalSummary (ownerId: string, startDate?: Date, endDate?: Date) {
   const where = {
      Property: { OwnerId: ownerId },
      ...(startDate && { startDate: { lte: endDate } }),
      ...(endDate && { endDate: { gte: startDate } })
   };

   const reservations = await prisma.reservation.findMany({
      where,
      include: {
         payment: true,
         Property: { include: { location: { include: { city: { include: { province: true } } } } } }
      }
   });

   const summary = reservations.reduce(
      (acc, r) => {
         const amount = r.payment?.amount || 0;

         if (r.orderStatus === 'CONFIRMED') {
            acc.totalActualRevenue += amount;
         }

         if ([ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ].includes(r.orderStatus) && amount > 0) {
            acc.totalProjectedRevenue += amount;
         }

         if (
            [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ].includes(r.orderStatus) &&
            new Date(r.startDate) >= NOW
         ) {
            acc.totalActiveBookings++;
         }

         return acc;
      },
      {
         totalProperties: 0,
         totalActiveBookings: 0,
         totalActualRevenue: 0,
         totalProjectedRevenue: 0
      } as ReportInterface.DashboardGlobalSummary
   );

   summary.totalProperties = new Set(reservations.map(r => r.propertyId)).size;

   return summary;
}
