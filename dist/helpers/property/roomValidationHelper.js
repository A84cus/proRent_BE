"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomValidationHelper {
    // Validate room creation data
    static validateCreateRoomData(data) {
        var _a;
        const errors = [];
        // Required fields validation
        if (!data.propertyId || typeof data.propertyId !== "string") {
            errors.push("Property ID is required and must be a string");
        }
        if (!data.roomTypeId || typeof data.roomTypeId !== "string") {
            errors.push("Room Type ID is required and must be a string");
        }
        // Optional fields validation
        if (data.name !== undefined && typeof data.name !== "string") {
            errors.push("Room name must be a string");
        }
        if (data.pictures && !Array.isArray(data.pictures)) {
            errors.push("Pictures must be an array of picture IDs");
        }
        if (data.pictures &&
            data.pictures.some((pic) => typeof pic !== "string")) {
            errors.push("All picture IDs must be strings");
        }
        if (errors.length > 0) {
            return { isValid: false, errors };
        }
        return {
            isValid: true,
            errors: [],
            cleanData: {
                roomTypeId: data.roomTypeId.trim(),
                propertyId: data.propertyId.trim(),
                name: (_a = data.name) === null || _a === void 0 ? void 0 : _a.trim(),
                pictures: data.pictures || [],
            },
        };
    }
    // Validate room update data
    static validateUpdateRoomData(data) {
        const errors = [];
        const updateData = {};
        // name validation
        if (data.name !== undefined) {
            if (typeof data.name !== "string" || data.name.trim().length === 0) {
                errors.push("Name must be a non-empty string");
            }
            else {
                updateData.name = data.name.trim();
            }
        }
        // isAvailable validation
        if (data.isAvailable !== undefined) {
            if (typeof data.isAvailable !== "boolean") {
                errors.push("isAvailable must be a boolean");
            }
            else {
                updateData.isAvailable = data.isAvailable;
            }
        }
        // pictures validation
        if (data.pictures !== undefined) {
            if (!Array.isArray(data.pictures)) {
                errors.push("Pictures must be an array of picture IDs");
            }
            else if (data.pictures.some((pic) => typeof pic !== "string")) {
                errors.push("All picture IDs must be strings");
            }
            else {
                updateData.pictures = data.pictures;
            }
        }
        // roomTypeId validation
        if (data.roomTypeId !== undefined) {
            if (typeof data.roomTypeId !== "string" ||
                data.roomTypeId.trim().length === 0) {
                errors.push("roomTypeId must be a non-empty string");
            }
            else {
                updateData.roomTypeId = data.roomTypeId.trim();
            }
        }
        if (errors.length > 0) {
            return { isValid: false, errors };
        }
        return {
            isValid: true,
            errors: [],
            cleanData: updateData,
        };
    }
    // Validate room ID parameter
    static validateRoomId(roomId) {
        const errors = [];
        if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
            errors.push("Room ID is required and must be a non-empty string");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    // Validate property ID parameter
    static validatePropertyId(propertyId) {
        const errors = [];
        if (!propertyId ||
            typeof propertyId !== "string" ||
            propertyId.trim().length === 0) {
            errors.push("Property ID is required and must be a non-empty string");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
exports.default = RoomValidationHelper;
