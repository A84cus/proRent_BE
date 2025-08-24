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
exports.aggregateReservationData = aggregateReservationData;
exports.fetchUniqueUsers = fetchUniqueUsers;
exports.aggregateRoomTypeReservationData = aggregateRoomTypeReservationData;
exports.fetchRoomTypeUniqueUsers = fetchRoomTypeUniqueUsers;
// src/services/report/cronJob/cronjobAggregationService.ts
const prisma_1 = __importDefault(require("../../../prisma")); // Adjust path
const library_1 = require("@prisma/client/runtime/library");
const client_1 = require("@prisma/client");
// --- Property Aggregation ---
function aggregateReservationData(propertyId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log(`[DEBUG] aggregateReservationData called for Property: ${propertyId}`);
        console.log(`[DEBUG] Stay Period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            // --- 1. Find relevant CONFIRMED Reservation IDs based on STAY DATES ---
            const reservations = yield prisma_1.default.reservation.findMany({
                where: {
                    propertyId,
                    orderStatus: client_1.Status.CONFIRMED,
                    startDate: { lte: endDate },
                    endDate: { gte: startDate }
                },
                select: {
                    id: true
                }
            });
            const reservationIds = reservations.map(r => r.id);
            const totalReservations = reservationIds.length;
            console.log(`[DEBUG] Found ${totalReservations} CONFIRMED reservations for Property ${propertyId} based on stay dates.`);
            console.log(`[DEBUG] Sample Reservation IDs: ${reservationIds.slice(0, 5)}`);
            // --- 2. If no reservations, return zeros ---
            if (totalReservations === 0) {
                console.log(`[DEBUG] No reservations found based on stay dates, returning zero values for Property ${propertyId}.`);
                return { totalRevenue: new library_1.Decimal(0), totalReservations: 0 };
            }
            // --- 3. Aggregate Payments directly for these Reservation IDs ---
            const paymentAggregation = yield prisma_1.default.payment.aggregate({
                where: {
                    reservationId: {
                        in: reservationIds
                    },
                    // Optionally, add payment status check if needed (e.g., only PAID payments contribute to revenue)
                    paymentStatus: client_1.Status.CONFIRMED
                },
                _sum: {
                    amount: true // Sum the payment amount directly
                },
                _count: {
                    _all: true // Count the payments
                }
            });
            const rawSumAmount = (_b = (_a = paymentAggregation._sum) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : 0;
            const paymentCount = paymentAggregation._count._all;
            const totalRevenue = new library_1.Decimal(rawSumAmount);
            console.log(`[DEBUG] Payment Aggregation Result for Property ${propertyId}:`);
            console.log(`[DEBUG]   Raw Sum Amount: ${rawSumAmount}`);
            console.log(`[DEBUG]   Total Revenue (Decimal): ${totalRevenue.toString()}`);
            console.log(`[DEBUG]   Payment Record Count: ${paymentCount}`);
            return { totalRevenue, totalReservations };
        }
        catch (error) {
            console.error(`[ERROR] Error in aggregateReservationData for property ${propertyId}:`, error);
            throw error; // Re-throw for upstream handling
        }
    });
}
// ... (fetchUniqueUsers function remains largely the same, but consider if it should also use stay dates) ...
function fetchUniqueUsers(propertyId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const userReservations = yield prisma_1.default.reservation.findMany({
            where: {
                propertyId,
                orderStatus: client_1.Status.CONFIRMED,
                // --- Use Stay Dates for Unique Users too ---
                startDate: { lte: endDate },
                endDate: { gte: startDate }
            },
            select: {
                userId: true
            }
        });
        return new Set(userReservations.map(r => r.userId)).size;
    });
}
// --- RoomType Aggregation ---
function aggregateRoomTypeReservationData(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log(`[DEBUG] aggregateRoomTypeReservationData called for RoomType: ${roomTypeId}`);
        console.log(`[DEBUG] Stay Period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            // --- 1. Find relevant CONFIRMED Reservation IDs based on STAY DATES ---
            const reservations = yield prisma_1.default.reservation.findMany({
                where: {
                    roomTypeId,
                    orderStatus: client_1.Status.CONFIRMED,
                    // --- KEY CHANGE: Filter by Stay Dates ---
                    startDate: { lte: endDate }, // Stay started on or before the target period ends
                    endDate: { gte: startDate } // Stay ended on or after the target period starts
                },
                select: {
                    id: true,
                    startDate: true, // Select dates for nights calculation
                    endDate: true
                }
            });
            const reservationIds = reservations.map(r => r.id);
            const totalReservations = reservationIds.length;
            console.log(`[DEBUG] Found ${totalReservations} CONFIRMED reservations for RoomType ${roomTypeId} based on stay dates.`);
            console.log(`[DEBUG] Sample Reservation IDs: ${reservationIds.slice(0, 5)}`);
            // --- 2. Calculate Total Nights Booked ---
            let totalNightsBooked = 0;
            reservations.forEach(res => {
                const start = new Date(res.startDate);
                const end = new Date(res.endDate);
                // --- NIGHT CALCULATION LOGIC ---
                // This calculates the number of nights stayed.
                // Assumes endDate is the checkout date (exclusive).
                // E.g., Stay from 2024-01-01 to 2024-01-03 means nights on 01 and 02.
                const diffTime = Math.max(end.getTime() - start.getTime(), 0);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalNightsBooked += diffDays;
            });
            console.log(`[DEBUG] Calculated Total Nights Booked for RoomType ${roomTypeId}: ${totalNightsBooked}`);
            // --- 3. If no reservations, return zeros ---
            if (totalReservations === 0) {
                console.log(`[DEBUG] No reservations found based on stay dates, returning zero values for RoomType ${roomTypeId}.`);
                return { totalRevenue: new library_1.Decimal(0), totalReservations: 0, totalNightsBooked: 0 };
            }
            // --- 4. Aggregate Payments directly for these Reservation IDs ---
            const paymentAggregation = yield prisma_1.default.payment.aggregate({
                where: {
                    reservationId: {
                        in: reservationIds
                    },
                    paymentStatus: client_1.Status.CONFIRMED // Add if needed
                },
                _sum: {
                    amount: true
                },
                _count: {
                    _all: true
                }
            });
            const rawSumAmount = (_b = (_a = paymentAggregation._sum) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : 0;
            const paymentCount = paymentAggregation._count._all;
            const totalRevenue = new library_1.Decimal(rawSumAmount);
            console.log(`[DEBUG] Payment Aggregation Result for RoomType ${roomTypeId}:`);
            console.log(`[DEBUG]   Raw Sum Amount: ${rawSumAmount}`);
            console.log(`[DEBUG]   Total Revenue (Decimal): ${totalRevenue.toString()}`);
            console.log(`[DEBUG]   Payment Record Count: ${paymentCount}`);
            return { totalRevenue, totalReservations, totalNightsBooked };
        }
        catch (error) {
            console.error(`[ERROR] Error in aggregateRoomTypeReservationData for roomType ${roomTypeId}:`, error);
            throw error;
        }
    });
}
// ... (fetchRoomTypeUniqueUsers function remains largely the same, but consider stay dates) ...
function fetchRoomTypeUniqueUsers(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        // Decide if this should also be based on stay dates or creation dates
        // For consistency, let's use stay dates
        const userReservations = yield prisma_1.default.reservation.findMany({
            where: {
                roomTypeId,
                orderStatus: client_1.Status.CONFIRMED,
                // --- Use Stay Dates for Unique Users too ---
                startDate: { lte: endDate },
                endDate: { gte: startDate }
            },
            select: {
                userId: true
            }
        });
        return new Set(userReservations.map(r => r.userId)).size;
    });
}
