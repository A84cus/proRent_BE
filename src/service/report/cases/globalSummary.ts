// src/services/report/cases/globalSummary.ts (Leaner Query)
import prisma from '../../../prisma';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

const NOW = new Date();

export async function loadGlobalSummary (ownerId: string, startDate?: Date, endDate?: Date) {
   const where = {
      Property: { OwnerId: ownerId },
      ...(startDate && { startDate: { lte: endDate } }),
      ...(endDate && { endDate: { gte: startDate } })
   };

   // Fetch only essential fields and payment amount
   const reservations = await prisma.reservation.findMany({
      where,
      select: {
         // Use 'select' instead of 'include'
         id: true, // Needed for Set size calculation if kept
         propertyId: true, // Needed for Set size calculation
         orderStatus: true,
         startDate: true,
         payment: {
            select: {
               amount: true
            }
         }
      }
   });

   // Reduce logic remains largely the same, just working with selected fields
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

   // Calculate unique properties using the fetched data
   summary.totalProperties = new Set(reservations.map(r => r.propertyId)).size;

   return summary;
}
