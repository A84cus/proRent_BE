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
const availabilityRepository_1 = __importDefault(require("../../repository/property/availabilityRepository"));
const roomRepository_1 = __importDefault(require("../../repository/property/roomRepository"));
const roomTypeRepository_1 = __importDefault(require("../../repository/property/roomTypeRepository"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
class FlexibleAvailabilityService {
    /**
     * Set bulk availability - handles both Room ID and RoomType ID
     */
    setBulkAvailability(id, availabilityData, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, try to find if it's a Room ID
                const room = yield roomRepository_1.default.findByIdAndOwner(id, ownerId);
                if (room) {
                    // It's a Room ID - set availability for this specific room
                    return this.setBulkAvailabilityForRoom(id, availabilityData, ownerId);
                }
                // Try to find if it's a RoomType ID
                const roomType = yield roomTypeRepository_1.default.findByIdAndOwner(id, ownerId);
                if (roomType) {
                    // It's a RoomType ID - set availability for all rooms of this type
                    return this.setBulkAvailabilityForRoomType(id, availabilityData, ownerId);
                }
                throw new Error("Room or RoomType not found");
            }
            catch (error) {
                logger_1.default.error("Error setting bulk availability:", error);
                throw error;
            }
        });
    }
    /**
     * Get monthly availability - handles both Room ID and RoomType ID
     */
    getMonthlyAvailability(id, year, month, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, try to find if it's a Room ID
                const room = yield roomRepository_1.default.findByIdAndOwner(id, ownerId);
                if (room) {
                    // It's a Room ID
                    return this.getMonthlyAvailabilityForRoom(id, year, month, ownerId);
                }
                // Try to find if it's a RoomType ID
                const roomType = yield roomTypeRepository_1.default.findByIdAndOwner(id, ownerId);
                if (roomType) {
                    // It's a RoomType ID
                    return this.getMonthlyAvailabilityForRoomType(id, year, month, ownerId);
                }
                throw new Error("Room or RoomType not found");
            }
            catch (error) {
                logger_1.default.error("Error getting monthly availability:", error);
                throw error;
            }
        });
    }
    // Private methods for Room-level operations
    setBulkAvailabilityForRoom(roomId, availabilityData, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield roomRepository_1.default.findByIdAndOwner(roomId, ownerId);
            if (!room) {
                throw new Error("Room not found or no permission");
            }
            // Validate and parse dates
            const parsedAvailability = this.validateAndParseDates(availabilityData);
            // Check for existing reservations
            const dates = parsedAvailability.map((item) => item.date);
            const conflicts = yield availabilityRepository_1.default.getReservationConflicts(roomId, dates);
            if (conflicts.length > 0) {
                throw new Error("Cannot set unavailable dates with active reservations");
            }
            // Set availability for specific room
            yield availabilityRepository_1.default.bulkUpsertRoomAvailability(roomId, room.roomTypeId, parsedAvailability);
        });
    }
    setBulkAvailabilityForRoomType(roomTypeId, availabilityData, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomType = yield roomTypeRepository_1.default.findByIdAndOwner(roomTypeId, ownerId);
            if (!roomType) {
                throw new Error("RoomType not found or no permission");
            }
            // Validate and parse dates
            const parsedAvailability = this.validateAndParseDates(availabilityData);
            // Set availability for room type (affects available count for the room type)
            yield availabilityRepository_1.default.bulkUpsertRoomTypeAvailability(roomTypeId, parsedAvailability);
        });
    }
    getMonthlyAvailabilityForRoom(roomId, year, month, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield roomRepository_1.default.findByIdAndOwner(roomId, ownerId);
            if (!room) {
                throw new Error("Room not found or no permission");
            }
            const availabilities = yield availabilityRepository_1.default.findRoomAvailabilityByMonth(roomId, year, month);
            // Type assertion for room with included relations
            const roomWithRelations = room;
            return {
                roomId,
                roomName: room.name || `Room ${roomId.slice(-4)}`,
                roomType: {
                    id: roomWithRelations.roomType.id,
                    name: roomWithRelations.roomType.name,
                    basePrice: Number(roomWithRelations.roomType.basePrice),
                },
                month: `${year}-${month.toString().padStart(2, "0")}`,
                availabilities: availabilities.map((av) => ({
                    date: av.date.toISOString().split("T")[0],
                    isAvailable: av.availableCount > 0,
                    price: Number(roomWithRelations.roomType.basePrice), // Base price, can be adjusted with peak rates
                })),
            };
        });
    }
    getMonthlyAvailabilityForRoomType(roomTypeId, year, month, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomType = yield roomTypeRepository_1.default.findByIdAndOwner(roomTypeId, ownerId);
            if (!roomType) {
                throw new Error("RoomType not found or no permission");
            }
            const availabilities = yield availabilityRepository_1.default.findRoomTypeAvailabilityByMonth(roomTypeId, year, month);
            return {
                roomId: roomTypeId, // Using roomTypeId as roomId for consistency
                roomName: roomType.name,
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                    basePrice: Number(roomType.basePrice),
                },
                month: `${year}-${month.toString().padStart(2, "0")}`,
                availabilities: availabilities.map((av) => ({
                    date: av.date.toISOString().split("T")[0],
                    isAvailable: av.availableCount > 0,
                    price: Number(roomType.basePrice),
                })),
            };
        });
    }
    // Helper method for date validation
    validateAndParseDates(availabilityData) {
        return availabilityData.map((item) => {
            // Parse date string manually to avoid timezone issues
            const dateStr = item.date;
            const [year, month, day] = dateStr.split("-").map(Number);
            if (!year || !month || !day) {
                throw new Error(`Invalid date format: ${item.date}. Use YYYY-MM-DD format`);
            }
            // Create date in local timezone (no UTC conversion)
            const date = new Date(year, month - 1, day, 0, 0, 0, 0);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date: ${item.date}. Please check the date is valid`);
            }
            return {
                date,
                isAvailable: Boolean(item.isAvailable),
            };
        });
    }
}
exports.default = new FlexibleAvailabilityService();
