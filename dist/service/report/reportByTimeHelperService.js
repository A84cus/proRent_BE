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
exports.validatePropertyOwnership = validatePropertyOwnership;
exports.validateRoomTypeOwnership = validateRoomTypeOwnership;
exports.buildDateFilter = buildDateFilter;
exports.getGroupByFields = getGroupByFields;
exports.calculateSpecificDateFilter = calculateSpecificDateFilter;
exports.fetchReservationIdsForPeriod = fetchReservationIdsForPeriod;
exports.aggregatePayments = aggregatePayments;
exports.formatPeriodString = formatPeriodString;
// services/report/reportByTimeHelperService.ts
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../../prisma")); // Adjust path as needed
// --- Helper Functions (Internal) ---
function validatePropertyOwnership(ownerId, propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const propertyCheck = yield prisma_1.default.property.findUnique({
            where: { id: propertyId, OwnerId: ownerId },
            select: { id: true }
        });
        if (!propertyCheck) {
            throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
        }
    });
}
function validateRoomTypeOwnership(ownerId, roomTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomTypeCheck = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId, property: { OwnerId: ownerId } },
            select: { id: true }
        });
        if (!roomTypeCheck) {
            throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
        }
    });
}
function buildDateFilter(filters) {
    const { startDate, endDate } = filters;
    const dateFilter = {};
    if (startDate) {
        dateFilter.gte = startDate;
    }
    if (endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        dateFilter.lte = adjustedEndDate;
    }
    return dateFilter;
}
function getGroupByFields(period) {
    switch (period) {
        case 'year':
            return ['createdAt_year'];
        case 'month':
            return ['createdAt_year', 'createdAt_month'];
        case 'day':
            return ['createdAt_year', 'createdAt_month', 'createdAt_day'];
        default:
            throw new Error(`Unsupported period: ${period}`);
    }
}
function calculateSpecificDateFilter(periodGroup, baseDateFilter) {
    const specificDateFilter = Object.assign({}, baseDateFilter);
    if (periodGroup.createdAt_year !== null && periodGroup.createdAt_year !== undefined) {
        const yearStart = new Date(periodGroup.createdAt_year, 0, 1);
        const yearEnd = new Date(periodGroup.createdAt_year, 11, 31, 23, 59, 59, 999);
        specificDateFilter.gte = specificDateFilter.gte
            ? new Date(Math.max(specificDateFilter.gte.getTime(), yearStart.getTime()))
            : yearStart;
        specificDateFilter.lte = specificDateFilter.lte
            ? new Date(Math.min(specificDateFilter.lte.getTime(), yearEnd.getTime()))
            : yearEnd;
    }
    if (periodGroup.createdAt_month !== null && periodGroup.createdAt_month !== undefined) {
        const monthStart = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month - 1, 1);
        const monthEnd = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month, 0, 23, 59, 59, 999);
        specificDateFilter.gte = specificDateFilter.gte
            ? new Date(Math.max(specificDateFilter.gte.getTime(), monthStart.getTime()))
            : monthStart;
        specificDateFilter.lte = specificDateFilter.lte
            ? new Date(Math.min(specificDateFilter.lte.getTime(), monthEnd.getTime()))
            : monthEnd;
    }
    if (periodGroup.createdAt_day !== null && periodGroup.createdAt_day !== undefined) {
        const dayStart = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month - 1, periodGroup.createdAt_day);
        const dayEnd = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month - 1, periodGroup.createdAt_day, 23, 59, 59, 999);
        specificDateFilter.gte = specificDateFilter.gte
            ? new Date(Math.max(specificDateFilter.gte.getTime(), dayStart.getTime()))
            : dayStart;
        specificDateFilter.lte = specificDateFilter.lte
            ? new Date(Math.min(specificDateFilter.lte.getTime(), dayEnd.getTime()))
            : dayEnd;
    }
    return specificDateFilter;
}
function fetchReservationIdsForPeriod(identifier, dateFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        const whereClause = Object.assign({ orderStatus: 'CONFIRMED', createdAt: dateFilter }, identifier // Spread propertyId or roomTypeId
        );
        const reservations = yield prisma_1.default.reservation.findMany({
            where: whereClause,
            select: { id: true }
        });
        return reservations.map(r => r.id);
    });
}
function aggregatePayments(reservationIds) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (reservationIds.length === 0) {
            return new library_1.Decimal(0);
        }
        const paymentAggregation = yield prisma_1.default.payment.aggregate({
            where: { reservationId: { in: reservationIds } },
            _sum: { amount: true }
        });
        return new library_1.Decimal((_a = paymentAggregation._sum.amount) !== null && _a !== void 0 ? _a : 0);
    });
}
/**
 * Formats the period string based on the period type and group data.
 */
function formatPeriodString(period, periodGroup) {
    if (period === 'year') {
        return `${periodGroup.createdAt_year}`;
    }
    else if (period === 'month') {
        const monthStr = String(periodGroup.createdAt_month).padStart(2, '0');
        return `${periodGroup.createdAt_year}-${monthStr}`;
    }
    else {
        // day
        const monthStr = String(periodGroup.createdAt_month).padStart(2, '0');
        const dayStr = String(periodGroup.createdAt_day).padStart(2, '0');
        return `${periodGroup.createdAt_year}-${monthStr}-${dayStr}`;
    }
}
