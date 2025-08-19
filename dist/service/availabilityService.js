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
const availabilityRepository_1 = __importDefault(require("../repository/availabilityRepository"));
const logger_1 = __importDefault(require("../utils/logger"));
class AvailabilityService {
    // Set bulk availability for a room
    setBulkAvailability(roomId, availabilityData, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify room ownership
                const room = yield availabilityRepository_1.default.findRoomWithOwnership(roomId);
                if (!room) {
                    throw new Error("Room not found");
                }
                if (room.property.OwnerId !== ownerId) {
                    throw new Error("You don't have permission to manage this room's availability");
                }
                // Validate and parse dates
                const parsedAvailability = availabilityData.map((item) => {
                    const date = new Date(item.date);
                    if (isNaN(date.getTime())) {
                        throw new Error(`Invalid date format: ${item.date}. Use YYYY-MM-DD format`);
                    }
                    // Set time to start of day to avoid timezone issues
                    date.setHours(0, 0, 0, 0);
                    return {
                        date,
                        isAvailable: Boolean(item.isAvailable),
                    };
                });
                // Check for existing reservations that would conflict
                const dates = parsedAvailability.map((item) => item.date);
                const conflicts = yield availabilityRepository_1.default.getReservationConflicts(roomId, dates);
                if (conflicts.length > 0) {
                    const conflictDates = conflicts
                        .map((c) => `${c.startDate.toISOString().split("T")[0]} to ${c.endDate.toISOString().split("T")[0]}`)
                        .join(", ");
                    throw new Error(`Cannot set unavailable dates that have active reservations: ${conflictDates}`);
                }
                // Bulk upsert availability
                yield availabilityRepository_1.default.bulkUpsertRoomAvailability(roomId, room.roomType.id, parsedAvailability);
            }
            catch (error) {
                logger_1.default.error("Error setting bulk availability:", error);
                if (error instanceof Error) {
                    if (error.message === "Room not found" ||
                        error.message ===
                            "You don't have permission to manage this room's availability" ||
                        error.message.includes("Invalid date format") ||
                        error.message.includes("Cannot set unavailable dates")) {
                        throw error;
                    }
                }
                throw new Error("Failed to set room availability");
            }
        });
    }
    // Get monthly availability for a room
    getMonthlyAvailability(roomId, year, month, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify room ownership
                const room = yield availabilityRepository_1.default.findRoomWithOwnership(roomId);
                if (!room) {
                    throw new Error("Room not found");
                }
                if (room.property.OwnerId !== ownerId) {
                    throw new Error("You don't have permission to view this room's availability");
                }
                // Get availability data for the month
                const availabilities = yield availabilityRepository_1.default.findRoomAvailabilityByMonth(roomId, year, month);
                // Generate all dates for the month
                const monthDates = availabilityRepository_1.default.generateMonthDates(year, month);
                // Get existing reservations for the month
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                const reservations = yield availabilityRepository_1.default.getReservationConflicts(roomId, monthDates);
                // Get peak rates for the month
                const peakRates = yield availabilityRepository_1.default.getPeakRates(room.roomType.id, startDate, endDate);
                // Build response
                const availabilityMap = new Map(availabilities.map((avail) => [
                    avail.date.toISOString().split("T")[0],
                    avail.availableCount > 0,
                ]));
                const reservationMap = new Map();
                reservations.forEach((res) => {
                    const start = new Date(res.startDate);
                    const end = new Date(res.endDate);
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dateStr = d.toISOString().split("T")[0];
                        reservationMap.set(dateStr, true);
                    }
                });
                // Helper function to get peak rate for a specific date
                const getPeakRateForDate = (date) => {
                    return peakRates.find((rate) => {
                        const rateStart = new Date(rate.startDate);
                        const rateEnd = new Date(rate.endDate);
                        return date >= rateStart && date <= rateEnd;
                    });
                };
                const response = {
                    roomId: room.id,
                    roomName: room.name || `Room ${room.id}`,
                    roomType: {
                        id: room.roomType.id,
                        name: room.roomType.name,
                        basePrice: Number(room.roomType.basePrice),
                    },
                    month: `${year}-${month.toString().padStart(2, "0")}`,
                    availabilities: monthDates.map((date) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const isExplicitlySet = availabilityMap.has(dateStr);
                        const isAvailable = isExplicitlySet
                            ? availabilityMap.get(dateStr)
                            : true; // Default to available if not set
                        const hasReservation = reservationMap.has(dateStr);
                        const peakRate = getPeakRateForDate(date);
                        return Object.assign({ date: dateStr, isAvailable: isAvailable && !hasReservation, // Not available if has reservation
                            hasReservation }, (peakRate && {
                            peakRate: {
                                name: peakRate.name || "Peak Season",
                                value: Number(peakRate.value),
                                rateType: peakRate.rateType,
                            },
                        }));
                    }),
                };
                return response;
            }
            catch (error) {
                logger_1.default.error("Error getting monthly availability:", error);
                if (error instanceof Error) {
                    if (error.message === "Room not found" ||
                        error.message ===
                            "You don't have permission to view this room's availability") {
                        throw error;
                    }
                }
                throw new Error("Failed to get room availability");
            }
        });
    }
}
exports.default = new AvailabilityService();
