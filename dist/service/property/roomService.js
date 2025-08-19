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
const roomRepository_1 = __importDefault(require("../../repository/property/roomRepository"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const roomServiceErrors_1 = require("../../constants/services/roomServiceErrors");
class RoomService {
    // Get all rooms by property ID
    getRoomsByProperty(propertyId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify property ownership
                const hasAccess = yield roomRepository_1.default.verifyPropertyOwnership(propertyId, ownerId);
                if (!hasAccess) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION);
                }
                return yield roomRepository_1.default.findAllByProperty(propertyId);
            }
            catch (error) {
                logger_1.default.error("Error fetching rooms by property:", error);
                if (error instanceof Error &&
                    error.message ===
                        roomServiceErrors_1.ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION) {
                    throw error;
                }
                throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.FAILED_TO_FETCH_ROOMS);
            }
        });
    }
    // Get room by ID with authorization check
    getRoomById(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield roomRepository_1.default.findByIdAndOwner(id, ownerId);
            }
            catch (error) {
                logger_1.default.error(`Error fetching room with ID ${id}:`, error);
                throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM);
            }
        });
    }
    // Create new room
    createRoom(data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Verify property ownership
                const hasAccess = yield roomRepository_1.default.verifyPropertyOwnership(data.propertyId, ownerId);
                if (!hasAccess) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION);
                }
                // Validate price and capacity
                if (data.basePrice <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID);
                }
                if (data.capacity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.CAPACITY_INVALID);
                }
                const roomData = {
                    name: data.name.trim(),
                    propertyId: data.propertyId,
                    roomTypeName: data.roomTypeName.trim(),
                    description: (_a = data.description) === null || _a === void 0 ? void 0 : _a.trim(),
                    basePrice: data.basePrice,
                    capacity: data.capacity,
                    pictures: data.pictures || [],
                };
                return yield roomRepository_1.default.createWithRoomType(roomData);
            }
            catch (error) {
                logger_1.default.error("Error creating room:", error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.CAPACITY_INVALID) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.FAILED_TO_CREATE_ROOM);
            }
        });
    }
    // Update room
    updateRoom(id, data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Check if room exists and belongs to owner's property
                const existingRoom = yield roomRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingRoom) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE);
                }
                // Validate price and capacity if provided
                if (data.basePrice !== undefined && data.basePrice <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID);
                }
                if (data.capacity !== undefined && data.capacity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.CAPACITY_INVALID);
                }
                // Prepare update data
                const updateData = {};
                if (data.name !== undefined)
                    updateData.name = data.name.trim();
                if (data.description !== undefined)
                    updateData.description = (_a = data.description) === null || _a === void 0 ? void 0 : _a.trim();
                if (data.basePrice !== undefined)
                    updateData.basePrice = data.basePrice;
                if (data.capacity !== undefined)
                    updateData.capacity = data.capacity;
                if (data.pictures !== undefined)
                    updateData.pictures = data.pictures;
                return yield roomRepository_1.default.updateRoomAndType(id, updateData);
            }
            catch (error) {
                logger_1.default.error(`Error updating room with ID ${id}:`, error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.CAPACITY_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.FAILED_TO_UPDATE_ROOM);
            }
        });
    }
    // Delete room
    deleteRoom(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if room exists and belongs to owner's property
                const existingRoom = yield roomRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingRoom) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE);
                }
                // Check if room has active bookings
                const hasActiveBookings = yield roomRepository_1.default.hasActiveBookings(id);
                if (hasActiveBookings) {
                    throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.CANNOT_DELETE_ROOM_WITH_BOOKINGS);
                }
                yield roomRepository_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error deleting room with ID ${id}:`, error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
                        error.message ===
                            roomServiceErrors_1.ROOM_SERVICE_ERRORS.CANNOT_DELETE_ROOM_WITH_BOOKINGS ||
                        error.message === roomServiceErrors_1.ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_SERVICE_ERRORS.FAILED_TO_DELETE_ROOM);
            }
        });
    }
}
exports.default = new RoomService();
