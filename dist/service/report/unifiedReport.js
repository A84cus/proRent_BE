"use strict";
// src/services/report/dashboard/handleUnifiedReport.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUnifiedReport = handleUnifiedReport;
const globalSummary_1 = require("./cases/globalSummary");
const loadReservations_1 = require("./cases/loadReservations");
const groupByPropertyAndRoomType_1 = require("./cases/groupByPropertyAndRoomType");
const loadAvailability_1 = require("./cases/loadAvailability");
const countUniqueCustomers_1 = require("./cases/countUniqueCustomers");
const buildReservationList_1 = require("./cases/buildReservationList");
const filterAndSortProperties_1 = require("./cases/filterAndSortProperties");
const updatePerformanceCache_1 = require("./cases/updatePerformanceCache");
const aggregateSummaries_1 = require("./utils/aggregateSummaries");
function handleUnifiedReport(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerId, filters, options, period, periodConfig } = context;
        const reportStart = filters.startDate || undefined;
        const reportEnd = filters.endDate || undefined;
        const filtersWithOwnerId = Object.assign(Object.assign({}, filters), { ownerId });
        const optionsForReservationList = options;
        // --- Step 1: Global Summary (Lean data) ---
        const globalSummary = yield (0, globalSummary_1.loadGlobalSummary)(ownerId, reportStart, reportEnd);
        // --- Step 2: Load Reservations (conditionally load details based on options) ---
        const reservations = yield (0, loadReservations_1.loadReservations)(ownerId, filters, reportStart, reportEnd, optionsForReservationList); // Pass options
        // --- Step 3: Group by Property & RoomType (Creates maps with initial structures) ---
        const { propertyMap, roomTypeMap } = yield (0, groupByPropertyAndRoomType_1.groupByPropertyAndRoomType)(reservations !== null && reservations !== void 0 ? reservations : [], ownerId);
        // --- Step 4: Load Availability (Populates availability data in roomTypeMap) ---
        yield (0, loadAvailability_1.loadAvailability)(roomTypeMap, reportStart, reportEnd);
        // --- Step 5: Unique Customers (Calculates unique customers per room type) ---
        (0, countUniqueCustomers_1.computeUniqueCustomers)(roomTypeMap, reservations !== null && reservations !== void 0 ? reservations : []);
        // --- Step 6: Build Reservation List (USES THE fetchAllData FLAG for pagination within room types) ---
        (0, buildReservationList_1.buildReservationList)(roomTypeMap, reservations !== null && reservations !== void 0 ? reservations : [], optionsForReservationList, filtersWithOwnerId);
        // --- Step 7: Filter and Sort Properties (Handles property-level pagination) ---
        const { paginatedProperties, total, totalPages } = (0, filterAndSortProperties_1.filterAndSortProperties)(propertyMap, roomTypeMap, reservations !== null && reservations !== void 0 ? reservations : [], filtersWithOwnerId, options);
        // --- Step 8: Aggregate Summary (Combines summaries from paginated properties) ---
        const aggregatedSummary = (0, aggregateSummaries_1.aggregateSummaries)(paginatedProperties.map(p => p.summary));
        // --- Step 9: Update Cache (Background task) ---
        (0, updatePerformanceCache_1.updatePerformanceCache)(reservations !== null && reservations !== void 0 ? reservations : [], ownerId, periodConfig).catch(console.error);
        // --- Conditional Processing Before Return ---
        const fetchAllData = typeof options.fetchAllData === 'boolean' ? options.fetchAllData : false;
        let finalPaginatedProperties; // Type expected by DashboardReportResponse
        if (fetchAllData) {
            finalPaginatedProperties = paginatedProperties;
        }
        else {
            finalPaginatedProperties = paginatedProperties.map(propBase => {
                const propertySummary = {
                    property: propBase.property,
                    period: propBase.period,
                    summary: propBase.summary,
                    roomTypes: propBase.roomTypes.map(rtBase => {
                        const roomTypeWithAvailability = {
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
    });
}
