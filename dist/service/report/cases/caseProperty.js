"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCase2 = handleCase2;
// src/services/report/dashboard/cases/case2_withProperty.ts
const prisma_1 = __importDefault(require("../../../prisma"));
const customReportService_1 = require("../customReportService");
const roomTypeSummaryService_1 = require("../roomTypeSummaryService");
const availabilityService = __importStar(require("../../reservationService/availabilityService"));
function handleCase2(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const { ownerId, filters, options, period, periodConfig } = context;
        const { propertyId } = filters;
        const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options; // Extract sorting options
        const { search } = filters; // Extract search filter
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId, OwnerId: ownerId },
            select: {
                id: true,
                name: true,
                mainPicture: true,
                location: { select: { address: true, city: { select: { name: true } } } }
            }
        });
        if (!property) {
            throw new Error(`Property ${propertyId} not found or not owned by owner.`);
        }
        // --- Map sortBy option to RoomTypePerformanceSummary field ---
        let summaryOrderByClause = { roomType: { name: sortDir } }; // Default fallback
        switch (sortBy) {
            case 'paymentAmount':
                summaryOrderByClause = { totalRevenue: sortDir }; // Sort by cached revenue
                break;
            case 'startDate':
            case 'endDate':
            case 'createdAt':
                // Similar logic as above for PropertyPerformanceSummary
                console.warn(`Sorting by ${sortBy} not directly supported on RoomTypePerformanceSummary. Falling back to name.`);
                summaryOrderByClause = { roomType: { name: sortDir } };
                break;
            default:
                summaryOrderByClause = { roomType: { name: sortDir } }; // Default to name
        }
        // --- Build search filter for RoomTypePerformanceSummary query ---
        const roomTypeSearchFilter = {
            propertyId, // Filter by specific property
            periodType: periodConfig.periodType,
            periodKey: periodConfig.periodKey
        };
        if (search) {
            roomTypeSearchFilter.roomType.name = {
                contains: search,
                mode: 'insensitive' // Case-insensitive search
            };
            // Similar to property search, can be extended for other fields if needed.
        }
        // Try cache for room type summaries - Apply sorting and search filtering here
        const cachedRoomTypeSummaries = yield prisma_1.default.roomTypePerformanceSummary.findMany({
            where: roomTypeSearchFilter,
            include: {
                roomType: {
                    select: {
                        id: true,
                        name: true
                        // Add other fields needed for RoomTypeMin if necessary
                    }
                }
                // Include property details if needed for the response structure
                // property: { select: { ... } }
            },
            orderBy: summaryOrderByClause, // <-- Use dynamic sorting
            skip: (page - 1) * pageSize,
            take: pageSize
        });
        if (cachedRoomTypeSummaries.length > 0) {
            // Important: Get the total count matching the search criteria for accurate pagination
            const totalCount = yield prisma_1.default.roomTypePerformanceSummary.count({
                where: roomTypeSearchFilter
            });
            const totalPages = Math.ceil(totalCount / pageSize);
            const roomTypeSummaries = yield Promise.all(cachedRoomTypeSummaries.map((summary) => __awaiter(this, void 0, void 0, function* () {
                // Fetch availability for each room type (this part is not cached)
                const totalQuantity = yield availabilityService.getRoomTypeTotalQuantity(summary.roomTypeId);
                const availabilityRecords = yield availabilityService.getActualAvailabilityRecords(summary.roomTypeId, filters.startDate, filters.endDate);
                const availability = availabilityRecords.map(record => {
                    const dateKey = record.date.toISOString().split('T')[0];
                    return {
                        date: dateKey,
                        available: record.availableCount,
                        isAvailable: record.availableCount > 0
                    };
                });
                return {
                    roomType: { id: summary.roomTypeId, name: summary.roomType.name },
                    counts: {
                        PENDING_PAYMENT: summary.pendingPaymentCount,
                        PENDING_CONFIRMATION: summary.pendingConfirmationCount,
                        CONFIRMED: summary.confirmedCount,
                        CANCELLED: summary.cancelledCount
                    },
                    revenue: {
                        actual: Number(summary.totalRevenue),
                        projected: Number(summary.projectedRevenue),
                        average: summary.confirmedCount > 0 ? Number(summary.totalRevenue) / summary.confirmedCount : 0
                    },
                    availability: { totalQuantity, dates: availability }
                };
            })));
            // Aggregate summary for the property level (from cached data)
            const propertySummaryData = {
                counts: {
                    PENDING_PAYMENT: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.PENDING_PAYMENT, 0),
                    PENDING_CONFIRMATION: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.PENDING_CONFIRMATION, 0),
                    CONFIRMED: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.CONFIRMED, 0),
                    CANCELLED: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.CANCELLED, 0)
                },
                revenue: {
                    actual: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.actual, 0),
                    projected: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.projected, 0),
                    average: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.average, 0) / roomTypeSummaries.length || 0
                }
            };
            return {
                properties: [
                    {
                        property: {
                            id: property.id,
                            name: property.name,
                            Picture: (_b = (_a = property.mainPicture) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : null,
                            address: (_d = (_c = property.location) === null || _c === void 0 ? void 0 : _c.address) !== null && _d !== void 0 ? _d : null,
                            city: (_f = (_e = property.location) === null || _e === void 0 ? void 0 : _e.city.name) !== null && _f !== void 0 ? _f : null
                        },
                        period,
                        summary: propertySummaryData,
                        roomTypes: roomTypeSummaries
                    }
                ],
                summary: propertySummaryData, // Or fetch from PropertyPerformanceSummary if needed
                period,
                pagination: { page, pageSize, total: totalCount, totalPages }
            };
        }
        // Cache miss - Proceed with fetching and calculating (less efficient)
        // Note: This path might also need to apply search/sorting if critical.
        const roomTypeBaseFilter = { propertyId };
        if (search) {
            roomTypeBaseFilter.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        const totalCount = yield prisma_1.default.roomType.count({
            where: roomTypeBaseFilter
        });
        const totalPages = Math.ceil(totalCount / pageSize);
        const skip = (page - 1) * pageSize;
        // On cache miss, fetch room types with search and basic sorting
        const roomTypes = yield prisma_1.default.roomType.findMany({
            where: roomTypeBaseFilter,
            skip,
            take: pageSize,
            orderBy: { name: 'asc' }, // Basic sorting on cache miss, could be improved
            select: { id: true, name: true }
        });
        const propertyReport = yield (0, customReportService_1.getReservationReport)(Object.assign({ ownerId, propertyId }, filters), { page: 1, pageSize: 1000 });
        const roomTypeSummaries = yield Promise.all(roomTypes.map((rt) => __awaiter(this, void 0, void 0, function* () {
            const report = yield (0, customReportService_1.getReservationReport)(Object.assign({ ownerId, propertyId, roomTypeId: rt.id }, filters), { page: 1, pageSize: 1000 });
            yield (0, roomTypeSummaryService_1.upsertRoomTypePerformanceSummary)(Object.assign(Object.assign({ roomTypeId: rt.id, propertyId }, periodConfig), { totalRevenue: report.summary.revenue.actual, projectedRevenue: report.summary.revenue.projected, totalReservations: report.summary.totalReservations, totalNightsBooked: 0, confirmedCount: report.summary.counts.CONFIRMED, pendingPaymentCount: report.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION, cancelledCount: report.summary.counts.CANCELLED, uniqueUsers: new Set(report.data.map(r => r.userId)).size, OwnerId: ownerId }));
            const totalQuantity = yield availabilityService.getRoomTypeTotalQuantity(rt.id);
            const availabilityRecords = yield availabilityService.getActualAvailabilityRecords(rt.id, filters.startDate, filters.endDate);
            const availability = availabilityRecords.map(record => {
                const dateKey = record.date.toISOString().split('T')[0];
                return {
                    date: dateKey,
                    available: record.availableCount,
                    isAvailable: record.availableCount > 0
                };
            });
            return {
                roomType: { id: rt.id, name: rt.name },
                counts: report.summary.counts,
                revenue: report.summary.revenue,
                availability: { totalQuantity, dates: availability }
            };
        })));
        return {
            properties: [
                {
                    property: {
                        id: property.id,
                        name: property.name,
                        Picture: (_h = (_g = property.mainPicture) === null || _g === void 0 ? void 0 : _g.url) !== null && _h !== void 0 ? _h : null,
                        address: (_k = (_j = property.location) === null || _j === void 0 ? void 0 : _j.address) !== null && _k !== void 0 ? _k : null,
                        city: (_m = (_l = property.location) === null || _l === void 0 ? void 0 : _l.city.name) !== null && _m !== void 0 ? _m : null
                    },
                    period,
                    summary: propertyReport.summary,
                    roomTypes: roomTypeSummaries
                }
            ],
            summary: propertyReport.summary,
            period,
            pagination: { page, pageSize, total: totalCount, totalPages }
        };
    });
}
