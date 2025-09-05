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

// --- Helper type for the conditional processing ---
// This type represents the structure returned by filterAndSortProperties when fetchAllData is false
type PropertySummaryBase = Omit<ReportInterface.PropertySummary, 'roomTypes'> & {
   roomTypes: Array<
      Omit<
         ReportInterface.RoomTypeWithAvailability,
         'reservationListItems' | 'pagination' // Fields to omit for dashboard
      >
   >;
};

export async function handleUnifiedReport (
   context: ReportInterface.DashboardContext
): Promise<ReportInterface.DashboardReportResponse> {
   const { ownerId, filters, options, period, periodConfig } = context;
   const reportStart = filters.startDate || undefined;
   const reportEnd = filters.endDate || undefined;
   const filtersWithOwnerId = { ...filters, ownerId };
   const optionsForReservationList = options;

   // --- Step 1: Global Summary (Lean data) ---
   const globalSummary = await loadGlobalSummary(ownerId, reportStart, reportEnd);

   // --- Step 2: Load Reservations (conditionally load details based on options) ---
   const reservations = await loadReservations(ownerId, filters, reportStart, reportEnd, optionsForReservationList); // Pass options

   // --- Step 3: Group by Property & RoomType (Creates maps with initial structures) ---
   const { propertyMap, roomTypeMap } = await groupByPropertyAndRoomType(reservations ?? [], ownerId);

   // --- Step 4: Load Availability (Populates availability data in roomTypeMap) ---
   await loadAvailability(roomTypeMap, reportStart, reportEnd);

   // --- Step 5: Unique Customers (Calculates unique customers per room type) ---
   computeUniqueCustomers(roomTypeMap, reservations ?? []);

   // --- Step 6: Build Reservation List (USES THE fetchAllData FLAG for pagination within room types) ---
   buildReservationList(roomTypeMap, reservations ?? [], optionsForReservationList, filtersWithOwnerId);

   // --- Step 7: Filter and Sort Properties (Handles property-level pagination) ---
   const { paginatedProperties, total, totalPages } = filterAndSortProperties(
      propertyMap,
      roomTypeMap,
      reservations ?? [],
      filtersWithOwnerId,
      options
   );

   // --- Step 8: Aggregate Summary (Combines summaries from paginated properties) ---
   const aggregatedSummary = aggregateSummaries(paginatedProperties.map(p => p.summary));

   // --- Step 9: Update Cache (Background task) ---
   updatePerformanceCache(reservations ?? [], ownerId, periodConfig).catch(console.error);

   // --- Conditional Processing Before Return ---
   const fetchAllData = typeof options.fetchAllData === 'boolean' ? options.fetchAllData : false;

   let finalPaginatedProperties: ReportInterface.PropertySummary[]; // Type expected by DashboardReportResponse

   if (fetchAllData) {
      finalPaginatedProperties = paginatedProperties as ReportInterface.PropertySummary[];
   } else {
      finalPaginatedProperties = (paginatedProperties as PropertySummaryBase[]).map(propBase => {
         const propertySummary: ReportInterface.PropertySummary = {
            property: propBase.property,
            period: propBase.period,
            summary: propBase.summary,

            roomTypes: propBase.roomTypes.map(rtBase => {
               const roomTypeWithAvailability: ReportInterface.RoomTypeWithAvailability = {
                  roomType: rtBase.roomType,
                  counts: rtBase.counts,
                  revenue: rtBase.revenue,
                  uniqueCustomers: rtBase.uniqueCustomers,
                  availability: rtBase.availability,
                  totalAmount: rtBase.totalAmount,
                  reservationListItems: [],
                  pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 }
               };
               return roomTypeWithAvailability;
            })
         };
         return propertySummary;
      });
   }
   // --- End of Conditional Processing ---

   // --- Final Response ---
   return {
      properties: finalPaginatedProperties, // This now matches the expected type
      summary: {
         Global: globalSummary,
         Aggregate: aggregatedSummary,
         period,
         pagination: { page: options.page || 1, pageSize: options.pageSize || 10, total, totalPages }
      }
   };
}
