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
exports.getTransactionRevenueSummary = getTransactionRevenueSummary;
const prisma_1 = __importDefault(require("../../prisma"));
const cronjobSubService_1 = require("./cronJob/cronjobSubService");
function getTransactionRevenueSummary(_a) {
    return __awaiter(this, arguments, void 0, function* ({ ownerId, propertyId, roomTypeId, startDate, endDate }) {
        const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const year = startDate.getFullYear();
        // 1. Try to get from PropertyPerformanceSummary
        if (propertyId) {
            const summary = yield getPropertySummary(propertyId, year, startDate, endDate);
            if (summary) {
                return enhanceWithAverages(summary, durationInDays);
            }
        }
        // 2. Try to get from RoomTypePerformanceSummary
        if (roomTypeId) {
            const summary = yield getRoomTypeSummary(roomTypeId, year, startDate, endDate);
            if (summary) {
                return enhanceWithAverages(summary, durationInDays);
            }
        }
        // 3. No summary → trigger recalculation and fallback
        yield (0, cronjobSubService_1.smartYearlyRecalculation)(year);
        const raw = yield fallbackCalculateFromReservations(ownerId, propertyId, roomTypeId, startDate, endDate);
        return enhanceWithAverages(raw, durationInDays);
    });
}
// --- Helpers ---
function getPropertySummary(propertyId, year, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const summary = yield prisma_1.default.propertyPerformanceSummary.findFirst({
            where: {
                propertyId,
                property: { OwnerId: propertyId },
                year
            }
        });
        if (!summary) {
            return null;
        }
        return {
            totalRevenue: Number(summary.totalRevenue),
            totalReservations: summary.totalReservations,
            uniqueUsers: summary.uniqueUsers
        };
    });
}
function getRoomTypeSummary(roomTypeId, year, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const summary = yield prisma_1.default.roomTypePerformanceSummary.findFirst({
            where: {
                roomTypeId,
                property: { OwnerId: roomTypeId }, // Ensure ownership
                year
            }
        });
        if (!summary) {
            return null;
        }
        return {
            totalRevenue: Number(summary.totalRevenue),
            totalReservations: summary.totalReservations,
            uniqueUsers: summary.uniqueUsers
        };
    });
}
function fallbackCalculateFromReservations(ownerId, propertyId, roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const where = {
            property: { OwnerId: ownerId },
            orderStatus: 'CONFIRMED',
            startDate: { lte: endDate },
            endDate: { gte: startDate }
        };
        if (propertyId) {
            where.propertyId = propertyId;
        }
        if (roomTypeId) {
            where.roomTypeId = roomTypeId;
        }
        const reservations = yield prisma_1.default.reservation.findMany({
            where,
            include: { payment: true, User: true }
        });
        const totalRevenue = reservations
            .filter(r => { var _a; return ((_a = r.payment) === null || _a === void 0 ? void 0 : _a.paymentStatus) === 'CONFIRMED'; })
            .reduce((sum, r) => { var _a; return sum + (((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        const totalReservations = reservations.length;
        const uniqueUsers = new Set(reservations.map(r => r.userId)).size;
        return { totalRevenue, totalReservations, uniqueUsers };
    });
}
function enhanceWithAverages(data, durationInDays) {
    const totalRevenue = data.totalRevenue || 0;
    const avgDailyRevenue = durationInDays > 0 ? totalRevenue / durationInDays : 0;
    const avgMonthlyRevenue = avgDailyRevenue * 30.44; // Average days per month
    return {
        totalRevenue,
        avgDailyRevenue,
        avgMonthlyRevenue,
        totalReservations: data.totalReservations || 0,
        uniqueUsers: data.uniqueUsers || 0
    };
}
