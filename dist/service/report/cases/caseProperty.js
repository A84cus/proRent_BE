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
        var _a, _b, _c, _d, _e, _f;
        const { ownerId, filters, options, period, periodConfig } = context;
        const { propertyId } = filters;
        const { page = 1, pageSize = 20 } = options;
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
        const totalCount = yield prisma_1.default.roomType.count({ where: { propertyId } });
        const totalPages = Math.ceil(totalCount / pageSize);
        const skip = (page - 1) * pageSize;
        const roomTypes = yield prisma_1.default.roomType.findMany({
            where: { propertyId },
            skip,
            take: pageSize,
            orderBy: { name: 'asc' },
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
                        Picture: (_b = (_a = property.mainPicture) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : null,
                        address: (_d = (_c = property.location) === null || _c === void 0 ? void 0 : _c.address) !== null && _d !== void 0 ? _d : null,
                        city: (_f = (_e = property.location) === null || _e === void 0 ? void 0 : _e.city.name) !== null && _f !== void 0 ? _f : null
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
