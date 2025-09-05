// src/services/report/dashboard/utils/buildContextFromRequest.ts

import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { buildPeriodConfig } from './utils/buildPeriodConfig';

export function buildContextFromRequest (req: any, ownerId: string): ReportInterface.DashboardContext {
   const query = req.query;

   const filters: Omit<ReportInterface.ReportFilters, 'ownerId'> = {
      propertyId: query.propertyId || undefined,
      roomTypeId: query.roomTypeId || undefined,
      propertySearch: query.propertySearch || undefined,
      city: query.city || undefined,
      province: query.province || undefined,
      roomTypeSearch: query.roomTypeSearch || undefined,
      customerName: query.customerName || undefined,
      email: query.email || undefined,
      invoiceNumber: query.invoiceNumber || undefined,
      reservationStatus: query.reservationStatus || undefined,
      startDate: query.startDate ? new Date(query.startDate) : null,
      endDate: query.endDate ? new Date(query.endDate) : null
   };

   const options: ReportInterface.ReportOptions = {
      page: parseInt(query.page as string) || 1,
      pageSize: parseInt(query.pageSize as string) || 10,
      reservationPage: query.reservationPage ? JSON.parse(query.reservationPage) : 1,
      reservationPageSize: parseInt(query.reservationPageSize as string) || 10,
      sortBy: query.sortBy || 'name',
      sortDir: (query.sortDir as 'asc' | 'desc') || 'asc',
      search: query.search || undefined
   };

   const startDate = filters.startDate ?? null;
   const endDate = filters.endDate ?? null;
   const periodConfig = buildPeriodConfig(startDate, endDate);

   return {
      ownerId,
      filters,
      options,
      period: { startDate, endDate },
      periodConfig
   };
}
