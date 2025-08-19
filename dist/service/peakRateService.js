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
const peakRateRepository_1 = __importDefault(require("../repository/peakRateRepository"));
const logger_1 = __importDefault(require("../utils/logger"));
class PeakRateService {
    // Add peak rate rule
    addPeakRate(roomId, data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify room ownership
                const room = yield peakRateRepository_1.default.findRoomWithOwnership(roomId);
                if (!room) {
                    throw new Error("Room not found");
                }
                if (room.property.OwnerId !== ownerId) {
                    throw new Error("You don't have permission to manage this room's pricing");
                }
                // Parse and validate dates
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    throw new Error("Invalid date format. Use YYYY-MM-DD format");
                }
                if (startDate >= endDate) {
                    throw new Error("Start date must be before end date");
                }
                if (startDate < new Date()) {
                    throw new Error("Start date cannot be in the past");
                }
                // Validate rate value
                if (data.value <= 0) {
                    throw new Error("Rate value must be greater than 0");
                }
                if (data.rateType === "PERCENTAGE" && data.value > 1000) {
                    throw new Error("Percentage rate cannot exceed 1000%");
                }
                // Check for overlapping rates
                const overlappingRates = yield peakRateRepository_1.default.findOverlappingRates(room.roomType.id, startDate, endDate);
                if (overlappingRates.length > 0) {
                    throw new Error("Peak rate overlaps with existing rate rules");
                }
                // Create peak rate
                return yield peakRateRepository_1.default.create({
                    roomTypeId: room.roomType.id,
                    startDate,
                    endDate,
                    rateType: data.rateType,
                    value: data.value,
                    description: data.description,
                });
            }
            catch (error) {
                logger_1.default.error("Error adding peak rate:", error);
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Failed to add peak rate");
            }
        });
    }
    // Update peak rate for specific date
    updatePeakRateForDate(roomId, dateStr, data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify room ownership
                const room = yield peakRateRepository_1.default.findRoomWithOwnership(roomId);
                if (!room) {
                    throw new Error("Room not found");
                }
                if (room.property.OwnerId !== ownerId) {
                    throw new Error("You don't have permission to manage this room's pricing");
                }
                // Parse target date
                const targetDate = new Date(dateStr);
                if (isNaN(targetDate.getTime())) {
                    throw new Error("Invalid date format. Use YYYY-MM-DD format");
                }
                // Find existing peak rate for this date
                const existingRate = yield peakRateRepository_1.default.findByRoomTypeAndDate(room.roomType.id, targetDate);
                if (!existingRate) {
                    throw new Error("No peak rate found for the specified date");
                }
                // Validate new dates if provided
                let updateData = {};
                if (data.startDate) {
                    const newStartDate = new Date(data.startDate);
                    if (isNaN(newStartDate.getTime())) {
                        throw new Error("Invalid start date format. Use YYYY-MM-DD format");
                    }
                    updateData.startDate = newStartDate;
                }
                if (data.endDate) {
                    const newEndDate = new Date(data.endDate);
                    if (isNaN(newEndDate.getTime())) {
                        throw new Error("Invalid end date format. Use YYYY-MM-DD format");
                    }
                    updateData.endDate = newEndDate;
                }
                // Validate date range if both dates are being updated
                const finalStartDate = updateData.startDate || existingRate.startDate;
                const finalEndDate = updateData.endDate || existingRate.endDate;
                if (finalStartDate >= finalEndDate) {
                    throw new Error("Start date must be before end date");
                }
                // Validate rate value if provided
                if (data.value !== undefined) {
                    if (data.value <= 0) {
                        throw new Error("Rate value must be greater than 0");
                    }
                    const rateType = data.rateType || existingRate.rateType;
                    if (rateType === "PERCENTAGE" && data.value > 1000) {
                        throw new Error("Percentage rate cannot exceed 1000%");
                    }
                    updateData.value = data.value;
                }
                if (data.rateType) {
                    updateData.rateType = data.rateType;
                }
                if (data.description !== undefined) {
                    updateData.description = data.description;
                }
                // Check for overlaps if dates are being changed
                if (updateData.startDate || updateData.endDate) {
                    const overlappingRates = yield peakRateRepository_1.default.findOverlappingRates(room.roomType.id, finalStartDate, finalEndDate, existingRate.id);
                    if (overlappingRates.length > 0) {
                        throw new Error("Updated date range would overlap with existing rate rules");
                    }
                }
                return yield peakRateRepository_1.default.update(existingRate.id, updateData);
            }
            catch (error) {
                logger_1.default.error("Error updating peak rate:", error);
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Failed to update peak rate");
            }
        });
    }
    // Remove peak rate for specific date
    removePeakRateForDate(roomId, dateStr, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify room ownership
                const room = yield peakRateRepository_1.default.findRoomWithOwnership(roomId);
                if (!room) {
                    throw new Error("Room not found");
                }
                if (room.property.OwnerId !== ownerId) {
                    throw new Error("You don't have permission to manage this room's pricing");
                }
                // Parse target date
                const targetDate = new Date(dateStr);
                if (isNaN(targetDate.getTime())) {
                    throw new Error("Invalid date format. Use YYYY-MM-DD format");
                }
                // Find existing peak rate for this date
                const existingRate = yield peakRateRepository_1.default.findByRoomTypeAndDate(room.roomType.id, targetDate);
                if (!existingRate) {
                    throw new Error("No peak rate found for the specified date");
                }
                yield peakRateRepository_1.default.delete(existingRate.id);
            }
            catch (error) {
                logger_1.default.error("Error removing peak rate:", error);
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Failed to remove peak rate");
            }
        });
    }
}
exports.default = new PeakRateService();
