"use strict";
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
exports.updatePerformanceCache = updatePerformanceCache;
// service/report/cases/updatePerformanceCache.ts
const customReportService_1 = require("../customReportService");
const PerformanceSummaryService_1 = require("../PerformanceSummaryService");
const roomTypeSummaryService_1 = require("../roomTypeSummaryService");
const prisma_1 = __importDefault(require("../../../prisma"));
const CACHE_TTL_HOURS = 24;
function updatePerformanceCache(reservations, ownerId, periodConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const cutoffDate = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
        const propertyIds = [...new Set(reservations.map(r => r.propertyId))];
        const roomTypeIds = [...new Set(reservations.map(r => r.roomTypeId))];
        const [existingPropertySummaries, existingRoomTypeSummaries] = yield Promise.all([
            prisma_1.default.propertyPerformanceSummary.findMany({
                where: {
                    propertyId: { in: propertyIds },
                    periodType: periodConfig.periodType,
                    periodKey: periodConfig.periodKey
                },
                select: { propertyId: true, lastUpdated: true }
            }),
            prisma_1.default.roomTypePerformanceSummary.findMany({
                where: {
                    roomTypeId: { in: roomTypeIds },
                    periodType: periodConfig.periodType,
                    periodKey: periodConfig.periodKey
                },
                select: { roomTypeId: true, lastUpdated: true }
            })
        ]);
        const propertyMap = new Map(existingPropertySummaries.map(s => [s.propertyId, s.lastUpdated]));
        const roomTypeMap = new Map(existingRoomTypeSummaries.map(s => [s.roomTypeId, s.lastUpdated]));
        for (const r of reservations) {
            const propertyNeedsUpdate = !propertyMap.has(r.propertyId) || propertyMap.get(r.propertyId) < cutoffDate;
            const roomTypeNeedsUpdate = !roomTypeMap.has(r.roomTypeId) || roomTypeMap.get(r.roomTypeId) < cutoffDate;
            if (!propertyNeedsUpdate && !roomTypeNeedsUpdate) {
                continue;
            }
            try {
                const report = yield (0, customReportService_1.getReservationReport)({ ownerId, propertyId: r.propertyId, roomTypeId: r.roomTypeId }, { page: 1, pageSize: 1000 });
                const promises = [];
                if (propertyNeedsUpdate) {
                    promises.push((0, PerformanceSummaryService_1.upsertPropertyPerformanceSummary)(Object.assign(Object.assign({ propertyId: r.propertyId }, periodConfig), { totalRevenue: report.summary.revenue.actual, projectedRevenue: report.summary.revenue.projected, totalReservations: report.summary.totalReservations, confirmedCount: report.summary.counts.CONFIRMED, pendingPaymentCount: report.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION, cancelledCount: report.summary.counts.CANCELLED, uniqueUsers: new Set(report.data.map((r) => r.userId)).size, OwnerId: ownerId })));
                }
                if (roomTypeNeedsUpdate) {
                    promises.push((0, roomTypeSummaryService_1.upsertRoomTypePerformanceSummary)(Object.assign(Object.assign({ roomTypeId: r.roomTypeId, propertyId: r.propertyId }, periodConfig), { totalRevenue: report.summary.revenue.actual, projectedRevenue: report.summary.revenue.projected, totalReservations: report.summary.totalReservations, confirmedCount: report.summary.counts.CONFIRMED, pendingPaymentCount: report.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION, cancelledCount: report.summary.counts.CANCELLED, uniqueUsers: new Set(report.data.map((r) => r.userId)).size, OwnerId: ownerId })));
                }
                yield Promise.all(promises);
            }
            catch (error) {
                console.error(`Cache update failed for property ${r.propertyId}, roomType ${r.roomTypeId}:`, error);
            }
        }
    });
}
