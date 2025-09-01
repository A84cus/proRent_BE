// service/report/utils/aggregateSummaries.ts

import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export function aggregateSummaries (
   summaries: Array<{ counts: ReportInterface.StatusCounts; revenue: ReportInterface.RevenueSummary }>
) {
   const combinedCounts = summaries.reduce(
      (acc, s) => {
         acc.CONFIRMED += s.counts.CONFIRMED;
         acc.PENDING_PAYMENT += s.counts.PENDING_PAYMENT;
         acc.PENDING_CONFIRMATION += s.counts.PENDING_CONFIRMATION;
         acc.CANCELLED += s.counts.CANCELLED;
         return acc;
      },
      { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 }
   );

   const totalRevenue = summaries.reduce((sum, s) => sum + s.revenue.actual, 0);
   const average = combinedCounts.CONFIRMED > 0 ? totalRevenue / combinedCounts.CONFIRMED : 0;

   return {
      counts: combinedCounts,
      revenue: {
         actual: totalRevenue,
         projected: totalRevenue,
         average
      }
   };
}
