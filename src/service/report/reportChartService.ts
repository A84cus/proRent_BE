// src/service/report/reportChartService.ts

import { DashboardReportResponse } from '../../interfaces/report/reportCustomInterface';
import { ChartDataPoint } from '../../interfaces/report/reportDashboardInterface';
import { getOwnerDashboardReport } from './reportDashboardService';
import { getDailySummary } from './utils/getDailyChart';

export function formatReportForChart (report: DashboardReportResponse): ChartDataPoint {
   const summary = report.summary.Global;
   const aggregate = report.summary.Aggregate;
   const period = report.summary.period;

   let label = 'Unknown';
   if (period.startDate && period.endDate) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);

      if (start.getDate() === 1 && isLastDayOfMonth(end)) {
         label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (start.getMonth() === 0 && start.getDate() === 1 && end.getMonth() === 11 && end.getDate() === 31) {
         label = start.getFullYear().toString();
      } else {
         label = start.toISOString().split('T')[0];
      }
   }

   return {
      label,
      actualRevenue: summary.totalActualRevenue,
      projectedRevenue: summary.totalProjectedRevenue,
      reservations:
         aggregate.counts.CONFIRMED + aggregate.counts.PENDING_PAYMENT + aggregate.counts.PENDING_CONFIRMATION
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

         // Pass proper default options to avoid validation errors
         const report = await getOwnerDashboardReport(
            ownerId,
            {
               startDate,
               endDate
            },
            {
               page: 1,
               pageSize: 20,
               sortBy: 'startDate',
               sortDir: 'desc'
            }
         );

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

         // Pass proper default options to avoid validation errors
         const report = await getOwnerDashboardReport(
            ownerId,
            {
               startDate,
               endDate
            },
            {
               page: 1,
               pageSize: 20,
               sortBy: 'startDate',
               sortDir: 'desc'
            }
         );

         return formatReportForChart(report);
      })
   );
}

export async function getDailyRevenueChart (ownerId: string, days: number = 30): Promise<ChartDataPoint[]> {
   const today = new Date();
   const summaries = await Promise.all(
      Array.from({ length: days }, (_, i) => {
         const date = new Date(today);
         date.setDate(today.getDate() - (days - 1 - i)); // from oldest to today
         return getDailySummary(ownerId, date);
      })
   );

   return summaries.map(s => ({
      label: s.date,
      actualRevenue: s.actualRevenue,
      projectedRevenue: s.projectedRevenue,
      reservations: s.confirmed + s.pending
   }));
}
