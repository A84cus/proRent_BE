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
const logger_1 = __importDefault(require("../../utils/system/logger"));
const roomServiceErrors_1 = require("../../constants/services/roomServiceErrors");
class RoomTypeService {
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
                return yield roomTypeRepository_1.default.create(roomTypeData);
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
                return yield roomTypeRepository_1.default.update(id, updateData);
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
