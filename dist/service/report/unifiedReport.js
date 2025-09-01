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
        // Step 1: Global Summary
        const globalSummary = yield (0, globalSummary_1.loadGlobalSummary)(ownerId, reportStart, reportEnd);
        // Step2: Load Reservations
        const reservations = yield (0, loadReservations_1.loadReservations)(ownerId, filters, reportStart, reportEnd);
        // Step3: Group by Property & RoomType
        const { propertyMap, roomTypeMap } = yield (0, groupByPropertyAndRoomType_1.groupByPropertyAndRoomType)(reservations, ownerId);
        // Step4: Load Availability
        yield (0, loadAvailability_1.loadAvailability)(roomTypeMap, reportStart, reportEnd);
        // Step5: Unique Customers
        (0, countUniqueCustomers_1.computeUniqueCustomers)(roomTypeMap, reservations);
        const filtersWithOwnerId = Object.assign(Object.assign({}, filters), { ownerId });
        const optionsForReservationList = options;
        // Step6: Build Reservation List
        (0, buildReservationList_1.buildReservationList)(roomTypeMap, reservations, optionsForReservationList, filtersWithOwnerId);
        const { paginatedProperties, total, totalPages } = (0, filterAndSortProperties_1.filterAndSortProperties)(propertyMap, roomTypeMap, reservations, filtersWithOwnerId, options);
        // Step8: Aggregate Summary
        const aggregatedSummary = (0, aggregateSummaries_1.aggregateSummaries)(paginatedProperties.map(p => p.summary));
        // Step9: Update Cache (background)
        (0, updatePerformanceCache_1.updatePerformanceCache)(reservations, ownerId, periodConfig).catch(console.error);
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
    });
}
