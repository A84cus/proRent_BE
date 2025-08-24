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
exports.handleCase3 = handleCase3;
// src/services/report/dashboard/cases/case3_withRoomType.ts
const prisma_1 = __importDefault(require("../../../prisma"));
const customReportService_1 = require("../customReportService");
const roomTypeSummaryService_1 = require("../roomTypeSummaryService");
const availabilityService = __importStar(require("../../reservationService/availabilityService"));
function handleCase3(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { ownerId, filters, options, period, periodConfig } = context;
        const { propertyId, roomTypeId } = filters;
        const roomType = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
            select: {
                id: true,
                name: true,
                property: {
                    select: {
                        id: true,
                        name: true,
                        location: { select: { address: true, city: { select: { name: true } } } }
                    }
                }
            }
        });
        if (!roomType) {
            throw new Error(`RoomType ${roomTypeId} not found.`);
        }
        const fullReport = yield (0, customReportService_1.getReservationReport)(Object.assign({ ownerId, propertyId, roomTypeId }, filters), options);
        const customerMap = new Map();
        for (const item of fullReport.data) {
            customerMap.set(item.user.id, {
                id: item.user.id,
                email: item.user.email,
                firstName: item.user.profile.firstName,
                lastName: item.user.profile.lastName
            });
        }
        const data = fullReport.data.map(item => ({
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
        }));
        yield (0, roomTypeSummaryService_1.upsertRoomTypePerformanceSummary)(Object.assign(Object.assign({ roomTypeId: roomTypeId !== null && roomTypeId !== void 0 ? roomTypeId : '', propertyId }, periodConfig), { totalRevenue: fullReport.summary.revenue.actual, projectedRevenue: fullReport.summary.revenue.projected, totalReservations: fullReport.summary.totalReservations, totalNightsBooked: 0, confirmedCount: fullReport.summary.counts.CONFIRMED, pendingPaymentCount: fullReport.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: fullReport.summary.counts.PENDING_CONFIRMATION, cancelledCount: fullReport.summary.counts.CANCELLED, uniqueUsers: customerMap.size, OwnerId: ownerId }));
        const totalQuantity = yield availabilityService.getRoomTypeTotalQuantity(roomType.id);
        const availabilityRecords = yield availabilityService.getActualAvailabilityRecords(roomType.id, filters.startDate, filters.endDate);
        const availability = availabilityRecords.map(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            return {
                date: dateKey,
                available: record.availableCount,
                isAvailable: record.availableCount > 0
            };
        });
        const propertySummary = {
            property: {
                id: roomType.property.id,
                name: roomType.property.name,
                address: (_b = (_a = roomType.property.location) === null || _a === void 0 ? void 0 : _a.address) !== null && _b !== void 0 ? _b : null,
                city: (_d = (_c = roomType.property.location) === null || _c === void 0 ? void 0 : _c.city.name) !== null && _d !== void 0 ? _d : null
            },
            period,
            summary: fullReport.summary,
            uniqueCustomers: Array.from(customerMap.values()),
            data,
            pagination: fullReport.pagination,
            roomTypes: [
                {
                    roomType: { id: roomTypeId !== null && roomTypeId !== void 0 ? roomTypeId : '', name: roomType.name },
                    counts: fullReport.summary.counts,
                    revenue: fullReport.summary.revenue,
                    availability: { totalQuantity, dates: availability }
                }
            ]
        };
        return {
            properties: [propertySummary],
            summary: fullReport.summary,
            period,
            pagination: fullReport.pagination
        };
    });
}
