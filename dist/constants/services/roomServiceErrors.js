"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_TYPE_SERVICE_ERRORS = exports.ROOM_SERVICE_ERRORS = void 0;
// Room Service Error Messages Constants
exports.ROOM_SERVICE_ERRORS = {
    // Property access errors
    PROPERTY_NOT_FOUND_OR_NO_PERMISSION: "Property not found or you don't have permission to access it",
    PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION: "Property not found or you don't have permission to create rooms for it",
    // Room Type access errors
    ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION: "Room type not found or you don't have permission to access it",
    // Room access errors
    ROOM_NOT_FOUND: "Room not found",
    ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE: "Room not found or you don't have permission to update it",
    ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE: "Room not found or you don't have permission to delete it",
    // Validation errors (removed basePrice and capacity as they belong to RoomType)
    ROOM_NAME_REQUIRED: "Room name is required",
    // Business logic errors
    CANNOT_DELETE_ROOM_WITH_BOOKINGS: "Cannot delete room with active bookings",
    // Operation errors
    FAILED_TO_FETCH_ROOMS: "Failed to fetch rooms",
    FAILED_TO_FETCH_ROOM: "Failed to fetch room",
    FAILED_TO_CREATE_ROOM: "Failed to create room",
    FAILED_TO_UPDATE_ROOM: "Failed to update room",
    FAILED_TO_DELETE_ROOM: "Failed to delete room",
};
exports.ROOM_TYPE_SERVICE_ERRORS = {
    // Property access errors
    PROPERTY_NOT_FOUND_OR_NO_PERMISSION: "Property not found or you don't have permission to access it",
    PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION: "Property not found or you don't have permission to create room types for it",
    // Room Type access errors
    ROOM_TYPE_NOT_FOUND: "Room type not found",
    ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_UPDATE: "Room type not found or you don't have permission to update it",
    ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_DELETE: "Room type not found or you don't have permission to delete it",
    // Validation errors
    BASE_PRICE_INVALID: "Base price must be greater than 0",
    CAPACITY_INVALID: "Capacity must be greater than 0",
    TOTAL_QUANTITY_INVALID: "Total quantity must be greater than 0",
    ROOM_TYPE_NAME_EXISTS: "Room type with this name already exists for this property",
    // Business logic errors
    CANNOT_DELETE_ROOM_TYPE_WITH_ROOMS: "Cannot delete room type that has rooms assigned",
    // Operation errors
    FAILED_TO_FETCH_ROOM_TYPES: "Failed to fetch room types",
    FAILED_TO_FETCH_ROOM_TYPE: "Failed to fetch room type",
    FAILED_TO_CREATE_ROOM_TYPE: "Failed to create room type",
    FAILED_TO_UPDATE_ROOM_TYPE: "Failed to update room type",
    FAILED_TO_DELETE_ROOM_TYPE: "Failed to delete room type",
};
