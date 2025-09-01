// src/services/report/dashboard/handleUnifiedReport.ts

import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { loadGlobalSummary } from './cases/globalSummary';
import { loadReservations } from './cases/loadReservations';
import { groupByPropertyAndRoomType } from './cases/groupByPropertyAndRoomType';
import { loadAvailability } from './cases/loadAvailability';
import { computeUniqueCustomers } from './cases/countUniqueCustomers';
import { buildReservationList } from './cases/buildReservationList';
import { filterAndSortProperties } from './cases/filterAndSortProperties';
import { updatePerformanceCache } from './cases/updatePerformanceCache';
import { aggregateSummaries } from './utils/aggregateSummaries';
import prisma from '../../prisma';

export async function handleUnifiedReport (
   context: ReportInterface.DashboardContext
): Promise<ReportInterface.DashboardReportResponse> {
   const { ownerId, filters, options, period, periodConfig } = context;
   const reportStart = filters.startDate || undefined;
   const reportEnd = filters.endDate || undefined;

   // Step 1: Global Summary
   const globalSummary = await loadGlobalSummary(ownerId, reportStart, reportEnd);

   // Step2: Load Reservations
   const reservations = await loadReservations(ownerId, filters, reportStart, reportEnd);

   // Step3: Group by Property & RoomType
   const { propertyMap, roomTypeMap } = await groupByPropertyAndRoomType(reservations, ownerId);

   // Step4: Load Availability
   await loadAvailability(roomTypeMap, reportStart, reportEnd);

   // Step5: Unique Customers
   computeUniqueCustomers(roomTypeMap, reservations);

   const filtersWithOwnerId = { ...filters, ownerId };
   const optionsForReservationList = options;

   // Step6: Build Reservation List
   buildReservationList(roomTypeMap, reservations, optionsForReservationList, filtersWithOwnerId);
   const { paginatedProperties, total, totalPages } = filterAndSortProperties(
      propertyMap,
      roomTypeMap,
      reservations,
      filtersWithOwnerId,
      options
   );

   // Step8: Aggregate Summary
   const aggregatedSummary = aggregateSummaries(paginatedProperties.map(p => p.summary));

   // Step9: Update Cache (background)
   updatePerformanceCache(reservations, ownerId, periodConfig).catch(console.error);

   // Final Response
   return {
      properties: paginatedProperties,
      summary: {
         Global: globalSummary,
         Aggregate: aggregatedSummary,
         period,
         pagination: { page: options.page || 1, pageSize: options.pageSize || 10, total, totalPages }
      }
   };
}
