// src/services/report/dashboard/fallback.ts

import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export function fallbackResponse (): ReportInterface.DashboardReportResponse {
   return {
      properties: [],
      summary: {
         counts: { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
         revenue: { actual: 0, projected: 0, average: 0 }
      },
      period: { startDate: null, endDate: null },
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 }
   };
}
