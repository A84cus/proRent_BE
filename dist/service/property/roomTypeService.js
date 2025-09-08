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
const roomTypeRepository_1 = __importDefault(require("../../repository/property/roomTypeRepository"));
const roomRepository_1 = __importDefault(require("../../repository/property/roomRepository"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const roomServiceErrors_1 = require("../../constants/services/roomServiceErrors");
class RoomTypeService {
    // Helper function to auto-generate rooms for a room type
    autoGenerateRooms(roomType, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For whole property, quantity is always 1 and we don't create rooms
                if (roomType.isWholeUnit) {
                    return;
                }
                // Create rooms based on quantity
                const roomPromises = [];
                for (let i = 1; i <= quantity; i++) {
                    const roomName = `${roomType.name}-${String(i).padStart(3, "0")}`;
                    const roomData = {
                        name: roomName,
                        propertyId: roomType.propertyId,
                        roomTypeId: roomType.id,
                        pictures: [],
                    };
                    roomPromises.push(roomRepository_1.default.create(roomData));
                }
                yield Promise.all(roomPromises);
                // Update roomType totalQuantity to reflect actual room count
                yield this.updateRoomTypeQuantityByCount(roomType.id);
            }
            catch (error) {
                logger_1.default.error("Error auto-generating rooms:", error);
                throw new Error("Failed to auto-generate rooms for room type");
            }
        });
    }
    // Helper function to update roomType quantity based on actual room count
    updateRoomTypeQuantityByCount(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomCount = yield roomRepository_1.default.countRoomsByRoomType(roomTypeId);
                yield roomTypeRepository_1.default.update(roomTypeId, { totalQuantity: roomCount });
            }
            catch (error) {
                logger_1.default.error("Error updating room type quantity:", error);
                throw new Error("Failed to update room type quantity");
            }
        });
    }
    // Helper function to manage rooms quantity when roomType quantity changes
    manageRoomsQuantity(roomType, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Skip for whole unit properties
                if (roomType.isWholeUnit) {
                    return;
                }
                const currentRoomCount = yield roomRepository_1.default.countRoomsByRoomType(roomType.id);
                if (newQuantity > currentRoomCount) {
                    // Need to create more rooms
                    const roomsToCreate = newQuantity - currentRoomCount;
                    const roomPromises = [];
                    for (let i = currentRoomCount + 1; i <= newQuantity; i++) {
                        const roomName = `${roomType.name}-${String(i).padStart(3, "0")}`;
                        const roomData = {
                            name: roomName,
                            propertyId: roomType.propertyId,
                            roomTypeId: roomType.id,
                            pictures: [],
                        };
                        roomPromises.push(roomRepository_1.default.create(roomData));
                    }
                    yield Promise.all(roomPromises);
                }
                else if (newQuantity < currentRoomCount) {
                    // Need to remove excess rooms (remove rooms that don't have active bookings)
                    const roomsToRemove = currentRoomCount - newQuantity;
                    const allRooms = yield roomRepository_1.default.findAllByRoomType(roomType.id);
                    // Sort by created date (newest first) to remove the most recently created rooms
                    allRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    let removedCount = 0;
                    for (const room of allRooms) {
                        if (removedCount >= roomsToRemove)
                            break;
                        // Check if room has active bookings
                        const hasActiveBookings = yield roomRepository_1.default.hasActiveBookings(room.id);
                        if (!hasActiveBookings) {
                            yield roomRepository_1.default.delete(room.id);
                            removedCount++;
                        }
                    }
                    // If couldn't remove enough rooms due to active bookings, log warning
                    if (removedCount < roomsToRemove) {
                        logger_1.default.warn(`Could only remove ${removedCount} out of ${roomsToRemove} rooms due to active bookings`);
                    }
                }
                // Update the quantity to reflect actual count
                yield this.updateRoomTypeQuantityByCount(roomType.id);
            }
            catch (error) {
                logger_1.default.error("Error managing rooms quantity:", error);
                throw new Error("Failed to manage rooms quantity");
            }
        });
    }
    // Get all room types by property ID
    getRoomTypesByProperty(propertyId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify property ownership
                const hasAccess = yield roomTypeRepository_1.default.verifyPropertyOwnership(propertyId, ownerId);
                if (!hasAccess) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION);
                }
                return yield roomTypeRepository_1.default.findAllByProperty(propertyId);
            }
            catch (error) {
                logger_1.default.error("Error fetching room types by property:", error);
                if (error instanceof Error &&
                    error.message ===
                        roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION) {
                    throw error;
                }
                throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM_TYPES);
            }
        });
    }
    // Get room type by ID with authorization check
    getRoomTypeById(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield roomTypeRepository_1.default.findByIdAndOwner(id, ownerId);
            }
            catch (error) {
                logger_1.default.error(`Error fetching room type with ID ${id}:`, error);
                throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM_TYPE);
            }
        });
    }
    // Create new room type
    createRoomType(data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Verify property ownership
                const hasAccess = yield roomTypeRepository_1.default.verifyPropertyOwnership(data.propertyId, ownerId);
                if (!hasAccess) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION);
                }
                // Validate required fields
                if (data.basePrice <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID);
                }
                if (data.capacity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID);
                }
                if (data.totalQuantity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID);
                }
                // Check if room type name already exists for this property
                const existingRoomType = yield roomTypeRepository_1.default.findByNameAndProperty(data.name.trim(), data.propertyId);
                if (existingRoomType) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS);
                }
                const roomTypeData = {
                    propertyId: data.propertyId,
                    name: data.name.trim(),
                    description: (_a = data.description) === null || _a === void 0 ? void 0 : _a.trim(),
                    basePrice: data.basePrice,
                    capacity: data.capacity,
                    totalQuantity: data.totalQuantity,
                    isWholeUnit: data.isWholeUnit || false,
                };
                // For whole property, set quantity to 1
                if (data.isWholeUnit) {
                    roomTypeData.totalQuantity = 1;
                }
                // Create room type first
                const createdRoomType = yield roomTypeRepository_1.default.create(roomTypeData);
                // Auto-generate rooms based on quantity (except for whole unit)
                if (!data.isWholeUnit) {
                    yield this.autoGenerateRooms(createdRoomType, data.totalQuantity);
                }
                return createdRoomType;
            }
            catch (error) {
                logger_1.default.error("Error creating room type:", error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_CREATE_ROOM_TYPE);
            }
        });
    }
    // Update room type
    updateRoomType(id, data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Check if room type exists and belongs to owner's property
                const existingRoomType = yield roomTypeRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingRoomType) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_UPDATE);
                }
                // Validate fields if provided
                if (data.basePrice !== undefined && data.basePrice <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID);
                }
                if (data.capacity !== undefined && data.capacity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID);
                }
                if (data.totalQuantity !== undefined && data.totalQuantity <= 0) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID);
                }
                // Check if new name conflicts with existing room types
                if (data.name) {
                    const conflictingRoomType = yield roomTypeRepository_1.default.findByNameAndProperty(data.name.trim(), existingRoomType.propertyId);
                    if (conflictingRoomType && conflictingRoomType.id !== id) {
                        throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS);
                    }
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
                if (data.totalQuantity !== undefined)
                    updateData.totalQuantity = data.totalQuantity;
                // Update room type
                const updatedRoomType = yield roomTypeRepository_1.default.update(id, updateData);
                // Handle quantity changes (create/remove rooms as needed)
                if (data.totalQuantity !== undefined &&
                    data.totalQuantity !== existingRoomType.totalQuantity) {
                    yield this.manageRoomsQuantity(updatedRoomType, data.totalQuantity);
                }
                return updatedRoomType;
            }
            catch (error) {
                logger_1.default.error(`Error updating room type with ID ${id}:`, error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_UPDATE_ROOM_TYPE);
            }
        });
    }
    // Delete room type
    deleteRoomType(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if room type exists and belongs to owner's property
                const existingRoomType = yield roomTypeRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingRoomType) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_DELETE);
                }
                // Check if room type has assigned rooms
                const hasAssignedRooms = yield roomTypeRepository_1.default.hasAssignedRooms(id);
                if (hasAssignedRooms) {
                    throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CANNOT_DELETE_ROOM_TYPE_WITH_ROOMS);
                }
                yield roomTypeRepository_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error deleting room type with ID ${id}:`, error);
                if (error instanceof Error) {
                    if (error.message ===
                        roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
                        error.message ===
                            roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.CANNOT_DELETE_ROOM_TYPE_WITH_ROOMS ||
                        error.message === roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND) {
                        throw error;
                    }
                }
                throw new Error(roomServiceErrors_1.ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_DELETE_ROOM_TYPE);
            }
        });
    }
}
exports.default = new RoomTypeService();
