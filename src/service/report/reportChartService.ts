import { DashboardReportResponse } from '../../interfaces/report/reportCustomInterface';
import { ChartDataPoint } from '../../interfaces/report/reportDashboardInterface';
import { getOwnerDashboardReport } from './reportDashboardService';

export function formatReportForChart (report: DashboardReportResponse): ChartDataPoint {
   const summary = report.summary;
   const period = report.period;

   // Generate label based on period
   let label = 'Unknown';
   if (period.startDate && period.endDate) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);

      if (start.getDate() === 1 && isLastDayOfMonth(end)) {
         // Month: "Aug 2025"
         label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (start.getMonth() === 0 && start.getDate() === 1 && end.getMonth() === 11 && end.getDate() === 31) {
         // Year: "2025"
         label = start.getFullYear().toString();
      } else {
         // Daily or custom: "2025-08-01"
         label = start.toISOString().split('T')[0];
      }
   }

   return {
      label,
      actualRevenue: summary.revenue.actual,
      projectedRevenue: summary.revenue.projected,
      reservations: summary.counts.CONFIRMED + summary.counts.PENDING_PAYMENT + summary.counts.PENDING_CONFIRMATION
   };
}

function isLastDayOfMonth (date: Date): boolean {
   const nextDay = new Date(date);
   nextDay.setDate(date.getDate() + 1);
   return nextDay.getMonth() !== date.getMonth();
}

export async function getYearlyRevenueChart (
   ownerId: string,
   years: number[] // e.g., [2023, 2024, 2025]
): Promise<ChartDataPoint[]> {
   return await Promise.all(
      years.map(async year => {
         const startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1
         const endDate = new Date(Date.UTC(year, 11, 31)); // Dec 31

         const report = await getOwnerDashboardReport(ownerId, {
            startDate,
            endDate
         });

         return formatReportForChart(report);
      })
   );
}

export async function getMonthlyRevenueChart (ownerId: string, year: number): Promise<ChartDataPoint[]> {
   const months = Array.from({ length: 12 }, (_, i) => i);
   return await Promise.all(
      months.map(async monthIndex => {
         const startDate = new Date(Date.UTC(year, monthIndex, 1));
         const endDate = new Date(Date.UTC(year, monthIndex + 1, 0)); // Last day

         const report = await getOwnerDashboardReport(ownerId, {
            startDate,
            endDate
         });

         return formatReportForChart(report);
      })
   );
}

export async function getDailyRevenueChart (ownerId: string, days: number = 30): Promise<ChartDataPoint[]> {
   const today = new Date();
   const points: ChartDataPoint[] = [];

   for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const report = await getOwnerDashboardReport(ownerId, {
         startDate: date,
         endDate: nextDay
      });

      points.push(formatReportForChart(report));
   }

   return points;
}
