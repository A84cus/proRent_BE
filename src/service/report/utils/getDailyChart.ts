// src/services/report/dashboard/utils/getDailySummary.ts

import prisma from '../../../prisma';

export async function getDailySummary (ownerId: string, date: Date) {
   const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
   const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));

   const reservations = await prisma.reservation.findMany({
      where: {
         Property: { OwnerId: ownerId },
         startDate: { lt: end },
         endDate: { gte: start }
      },
      select: {
         orderStatus: true,
         payment: { select: { amount: true } }
      }
   });

   let actualRevenue = 0;
   let projectedRevenue = 0;
   let confirmed = 0;
   let pending = 0;

   for (const r of reservations) {
      const amount = r.payment?.amount || 0;
      if (r.orderStatus === 'CONFIRMED') {
         actualRevenue += amount;
         confirmed++;
      } else if ([ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION' ].includes(r.orderStatus)) {
         projectedRevenue += amount;
         pending++;
      }
   }

   return {
      date: start.toISOString().split('T')[0],
      actualRevenue,
      projectedRevenue,
      confirmed,
      pending
   };
}
