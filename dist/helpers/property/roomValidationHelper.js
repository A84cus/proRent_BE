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
                roomTypeId: data.roomTypeId.trim(), // Changed from roomTypeName to roomTypeId
                propertyId: data.propertyId.trim(),
                name: (_a = data.name) === null || _a === void 0 ? void 0 : _a.trim(), // Made optional
                pictures: data.pictures || [],
            },
        };
    }
    // Validate room update data
    static validateUpdateRoomData(data) {
        const errors = [];
        const updateData = {};
        // Optional field validations (only include if provided)
        if (data.name !== undefined) {
            if (typeof data.name !== "string" || data.name.trim().length === 0) {
                errors.push("Name must be a non-empty string");
            }
            else {
                updateData.name = data.name.trim();
            }
        }
        if (data.name !== undefined) {
            if (typeof data.name !== "string") {
                errors.push("Name must be a string");
            }
            else {
                updateData.name = data.name.trim();
            }
        }
        if (data.isAvailable !== undefined) {
            if (typeof data.isAvailable !== "boolean") {
                errors.push("isAvailable must be a boolean");
            }
            else {
                updateData.isAvailable = data.isAvailable;
            }
        }
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
        if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
            return {
                isValid: false,
                error: "Room ID is required and must be a valid string",
            };
        }
        return {
            isValid: true,
            cleanId: roomId.trim(),
        };
    }
    // Validate property ID parameter
    static validatePropertyId(propertyId) {
        if (!propertyId ||
            typeof propertyId !== "string" ||
            propertyId.trim().length === 0) {
            return {
                isValid: false,
                error: "Property ID is required as query parameter",
            };
        }
        return {
            isValid: true,
            cleanId: propertyId.trim(),
        };
    }
}
exports.default = RoomValidationHelper;
