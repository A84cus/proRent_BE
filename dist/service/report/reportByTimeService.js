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
exports.getPropertySalesOverTime = getPropertySalesOverTime;
exports.getRoomTypeSalesOverTime = getRoomTypeSalesOverTime;
exports.getMostReservedMonth = getMostReservedMonth;
exports.calculateOccupancyByReservations = calculateOccupancyByReservations;
// services/report/reportByTimeService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const reportByTimeHelperService_1 = require("./reportByTimeHelperService");
const availabilityService_1 = require("../reservationService/availabilityService");
function getPropertySalesOverTime(ownerId_1, propertyId_1, period_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, propertyId, period, filters = {}) {
        yield (0, reportByTimeHelperService_1.validatePropertyOwnership)(ownerId, propertyId);
        const dateFilter = (0, reportByTimeHelperService_1.buildDateFilter)(filters);
        const groupByFields = (0, reportByTimeHelperService_1.getGroupByFields)(period);
        const orderByField = groupByFields[groupByFields.length - 1];
        const distinctPeriodsQuery = yield prisma_1.default.reservation.groupBy({
            by: groupByFields,
            where: { propertyId, orderStatus: 'CONFIRMED', createdAt: dateFilter },
            _count: { _all: true },
            orderBy: { [orderByField]: 'asc' }
        });
        const resultPromises = distinctPeriodsQuery.map((periodGroup) => __awaiter(this, void 0, void 0, function* () {
            const specificDateFilter = (0, reportByTimeHelperService_1.calculateSpecificDateFilter)(periodGroup, dateFilter);
            const reservationIds = yield (0, reportByTimeHelperService_1.fetchReservationIdsForPeriod)({ propertyId }, specificDateFilter);
            const totalSalesAmount = yield (0, reportByTimeHelperService_1.aggregatePayments)(reservationIds);
            const periodString = (0, reportByTimeHelperService_1.formatPeriodString)(period, periodGroup);
            return {
                period: periodString,
                totalSales: totalSalesAmount,
                transactionCount: periodGroup._count._all
            };
        }));
        const result = yield Promise.all(resultPromises);
        return result.sort((a, b) => a.period.localeCompare(b.period));
    });
}
function getRoomTypeSalesOverTime(ownerId_1, roomTypeId_1, period_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, roomTypeId, period, filters = {}) {
        yield (0, reportByTimeHelperService_1.validateRoomTypeOwnership)(ownerId, roomTypeId);
        const dateFilter = (0, reportByTimeHelperService_1.buildDateFilter)(filters);
        const groupByFields = (0, reportByTimeHelperService_1.getGroupByFields)(period);
        const orderByField = groupByFields[groupByFields.length - 1];
        const distinctPeriodsQuery = yield prisma_1.default.reservation.groupBy({
            by: groupByFields,
            where: { roomTypeId, orderStatus: 'CONFIRMED', createdAt: dateFilter },
            _count: { _all: true },
            orderBy: { [orderByField]: 'asc' }
        });
        const resultPromises = distinctPeriodsQuery.map((periodGroup) => __awaiter(this, void 0, void 0, function* () {
            const specificDateFilter = (0, reportByTimeHelperService_1.calculateSpecificDateFilter)(periodGroup, dateFilter);
            const reservationIds = yield (0, reportByTimeHelperService_1.fetchReservationIdsForPeriod)({ roomTypeId }, specificDateFilter);
            const totalSalesAmount = yield (0, reportByTimeHelperService_1.aggregatePayments)(reservationIds);
            const periodString = (0, reportByTimeHelperService_1.formatPeriodString)(period, periodGroup);
            return {
                period: periodString,
                totalSales: totalSalesAmount,
                transactionCount: periodGroup._count._all
            };
        }));
        const result = yield Promise.all(resultPromises);
        return result.sort((a, b) => a.period.localeCompare(b.period));
    });
}
function getMostReservedMonth(ownerId_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, filters = {}) {
        const { startDate, endDate } = filters;
        // Define date filter for reservations
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = startDate;
        }
        if (endDate) {
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            dateFilter.lte = adjustedEndDate;
        }
        const aggregatedData = yield prisma_1.default.reservation.groupBy({
            by: ['createdAt_month', 'createdAt_year'],
            where: {
                Property: {
                    OwnerId: ownerId
                },
                orderStatus: 'CONFIRMED',
                createdAt: dateFilter
            },
            _count: {
                _all: true
            },
            orderBy: {
                _count: {
                    _all: 'desc'
                }
            },
            take: 1
        });
        // Map result
        if (aggregatedData.length > 0) {
            const topMonthData = aggregatedData[0];
            const monthStr = String(topMonthData.createdAt_month).padStart(2, '0');
            const yearMonthString = `${topMonthData.createdAt_year}-${monthStr}`;
            return {
                yearMonth: yearMonthString,
                reservationCount: topMonthData._count._all
            };
        }
        return null;
    });
}
function calculateOccupancyByReservations(roomTypeIds, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const occupancyMap = {};
        const datesToCheck = (0, availabilityService_1.generateDateRange)(startDate, endDate); // Use your existing function
        for (const roomTypeId of roomTypeIds) {
            const dailyOccupancy = [];
            for (const date of datesToCheck) {
                const count = yield prisma_1.default.reservation.count({
                    where: {
                        roomTypeId,
                        orderStatus: 'CONFIRMED',
                        startDate: { lte: date },
                        endDate: { gt: date }
                    }
                });
                dailyOccupancy.push({
                    date: new Date(date),
                    occupiedCount: count
                });
            }
            occupancyMap[roomTypeId] = dailyOccupancy;
        }
        return occupancyMap;
    });
}
