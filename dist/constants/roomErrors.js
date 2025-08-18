"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_ERROR_MESSAGES = void 0;
exports.ROOM_ERROR_MESSAGES = {
    // Authentication errors
    "User not authenticated": {
        message: "User authentication required",
        statusCode: 401,
    },
    "User validation failed": {
        message: "User validation failed",
        statusCode: 401,
    },
    // Property access errors
    "Property not found or you don't have permission to access it": {
        message: "Property not found or you don't have permission to access it",
        statusCode: 404,
    },
    "Property not found or you don't have permission to create rooms": {
        message: "Property not found or you don't have permission to create rooms",
        statusCode: 404,
    },
    // Room errors
    "Room not found or you don't have permission to update it": {
        message: "Room not found or you don't have permission to update it",
        statusCode: 404,
    },
    "Room not found or you don't have permission to delete it": {
        message: "Room not found or you don't have permission to delete it",
        statusCode: 404,
    },
    "Cannot delete room with existing reservations": {
        message: "Cannot delete room with existing reservations",
        statusCode: 400,
    },
    // Service errors
    "Failed to fetch rooms": {
        message: "Failed to fetch rooms",
        statusCode: 500,
    },
    "Failed to create room": {
        message: "Failed to create room",
        statusCode: 500,
    },
    "Failed to update room": {
        message: "Failed to update room",
        statusCode: 500,
    },
    "Failed to delete room": {
        message: "Failed to delete room",
        statusCode: 500,
    },
};
