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
// 🔽 Cache TTL: Only re-upsert if record is older than 24 hours
const PERFORMANCE_SUMMARY_CACHE_TTL_HOURS = 24;
function handleCase2(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const { ownerId, filters, options, period, periodConfig } = context;
        const { propertyId } = filters;
        // Top-level pagination: for room types
        const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
        const { search } = filters;
        // 🔽 Pagination for reservations inside each room type
        const { reservationPage = 1, reservationPageSize = 10 } = options;
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
        // --- Build search filter for RoomTypePerformanceSummary query ---
        const roomTypeSearchFilter = {
            propertyId,
            periodType: periodConfig.periodType,
            periodKey: periodConfig.periodKey
        };
        if (search) {
            roomTypeSearchFilter.roomType = {
                name: { contains: search, mode: 'insensitive' }
            };
        }
        // Fetch room types (paginated)
        const cachedRoomTypeSummaries = yield prisma_1.default.roomTypePerformanceSummary.findMany({
            where: roomTypeSearchFilter,
            include: {
                roomType: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: getSummaryOrderByClause(sortBy, sortDir),
            skip: (page - 1) * pageSize,
            take: pageSize
        });
        const totalCount = yield prisma_1.default.roomTypePerformanceSummary.count({
            where: roomTypeSearchFilter
        });
        const totalPages = Math.ceil(totalCount / pageSize);
        const roomTypeSummaries = yield Promise.all(cachedRoomTypeSummaries.map((summary) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - PERFORMANCE_SUMMARY_CACHE_TTL_HOURS);
            let reportSummary;
            if (!summary.lastUpdated || summary.lastUpdated < cutoffDate) {
                const fullReport = yield (0, customReportService_1.getReservationReport)(Object.assign({ ownerId, propertyId, roomTypeId: summary.roomTypeId }, filters), { page: 1, pageSize: 1000 });
                yield (0, roomTypeSummaryService_1.upsertRoomTypePerformanceSummary)(Object.assign(Object.assign({ roomTypeId: summary.roomTypeId, propertyId }, periodConfig), { totalRevenue: fullReport.summary.revenue.actual, projectedRevenue: fullReport.summary.revenue.projected, totalReservations: fullReport.summary.totalReservations, totalNightsBooked: 0, confirmedCount: fullReport.summary.counts.CONFIRMED, pendingPaymentCount: fullReport.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: fullReport.summary.counts.PENDING_CONFIRMATION, cancelledCount: fullReport.summary.counts.CANCELLED, uniqueUsers: new Set(fullReport.data.map(r => r.userId)).size, OwnerId: ownerId }));
                reportSummary = fullReport.summary;
            }
            else {
                reportSummary = {
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
                    totalReservations: summary.totalReservations
                };
            }
            const roomReservationPage = typeof reservationPage === 'object' ? reservationPage[summary.roomTypeId] || 1 : reservationPage;
            const paginatedReport = yield (0, customReportService_1.getReservationReport)({
                ownerId,
                propertyId,
                roomTypeId: summary.roomTypeId,
                // ✅ Extract startDate and endDate to top level
                startDate: filters.startDate,
                endDate: filters.endDate
                // Include other filters if needed
            }, {
                page: roomReservationPage,
                pageSize: reservationPageSize
            });
            const customerMap = new Map();
            for (const item of paginatedReport.data) {
                customerMap.set(item.user.id, {
                    id: item.user.id,
                    email: item.user.email,
                    firstName: item.user.profile.firstName,
                    lastName: item.user.profile.lastName
                });
            }
            const totalQuantity = yield availabilityService.getRoomTypeTotalQuantity(summary.roomTypeId);
            const availabilityRecords = yield availabilityService.getActualAvailabilityRecords(summary.roomTypeId, (_a = filters.startDate) !== null && _a !== void 0 ? _a : undefined, (_b = filters.endDate) !== null && _b !== void 0 ? _b : undefined);
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
                counts: reportSummary.counts,
                revenue: reportSummary.revenue,
                availability: { totalQuantity, dates: availability },
                data: paginatedReport.data.map(item => ({
                    id: item.id,
                    userId: item.userId,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    orderStatus: item.orderStatus,
                    paymentAmount: item.paymentAmount,
                    user: {
                        email: item.user.email,
                        firstName: item.user.profile.firstName,
                        lastName: item.user.profile.lastName
                    }
                })),
                uniqueCustomers: Array.from(customerMap.values()),
                pagination: {
                    page: roomReservationPage,
                    pageSize: reservationPageSize,
                    total: paginatedReport.pagination.total,
                    totalPages: paginatedReport.pagination.totalPages
                }
            };
        })));
        // Aggregate property-level summary
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
                    period: {
                        startDate: filters.startDate || null,
                        endDate: filters.endDate || null
                    },
                    summary: propertySummaryData,
                    roomTypes: roomTypeSummaries
                }
            ],
            summary: propertySummaryData,
            period: { startDate: filters.startDate || null, endDate: filters.endDate || null },
            pagination: { page, pageSize, total: totalCount, totalPages }
        };
    });
}
function getSummaryOrderByClause(sortBy, sortDir) {
    switch (sortBy) {
        case 'paymentAmount':
            return { totalRevenue: sortDir };
        case 'roomTypeName':
            return { roomType: { name: sortDir } };
        default:
            return { roomType: { name: sortDir } };
    }
}
