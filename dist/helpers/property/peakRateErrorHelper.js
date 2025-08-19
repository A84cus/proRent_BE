"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
class PeakRateErrorHelper {
    /**
     * Get error mappings for add peak rate operations
     */
    static getAddPeakRateErrorMappings() {
        return {
            "Room not found": {
                message: property_1.PROPERTY_ERROR_MESSAGES.ROOM_NOT_FOUND,
                statusCode: 404,
            },
            "You don't have permission to manage this room's pricing": {
                message: property_1.PROPERTY_ERROR_MESSAGES.NO_PERMISSION_MANAGE_ROOM_PRICING,
                statusCode: 403,
            },
            "Invalid date format. Use YYYY-MM-DD format": {
                message: property_1.PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
                statusCode: 400,
            },
            "Start date must be before end date": {
                message: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE,
                statusCode: 400,
            },
            "Start date cannot be in the past": {
                message: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_NOT_IN_PAST,
                statusCode: 400,
            },
            "Rate value must be greater than 0": {
                message: property_1.PROPERTY_ERROR_MESSAGES.RATE_VALUE_GREATER_THAN_ZERO,
                statusCode: 400,
            },
            "Percentage rate cannot exceed 1000%": {
                message: property_1.PROPERTY_ERROR_MESSAGES.PERCENTAGE_RATE_LIMIT,
                statusCode: 400,
            },
            "Peak rate overlaps with existing rate rules": {
                message: property_1.PROPERTY_ERROR_MESSAGES.PEAK_RATE_OVERLAPS,
                statusCode: 409,
            },
            "Failed to add peak rate": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_ADD_PEAK_RATE,
                statusCode: 500,
            },
        };
    }
    /**
     * Get error mappings for update peak rate operations
     */
    static getUpdatePeakRateErrorMappings() {
        return {
            "Room not found": {
                message: property_1.PROPERTY_ERROR_MESSAGES.ROOM_NOT_FOUND,
                statusCode: 404,
            },
            "You don't have permission to manage this room's pricing": {
                message: property_1.PROPERTY_ERROR_MESSAGES.NO_PERMISSION_MANAGE_ROOM_PRICING,
                statusCode: 403,
            },
            "No peak rate found for the specified date": {
                message: property_1.PROPERTY_ERROR_MESSAGES.NO_PEAK_RATE_FOR_DATE,
                statusCode: 404,
            },
            "Invalid date format. Use YYYY-MM-DD format": {
                message: property_1.PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
                statusCode: 400,
            },
            "Invalid start date format. Use YYYY-MM-DD format": {
                message: property_1.PROPERTY_ERROR_MESSAGES.INVALID_START_DATE_FORMAT,
                statusCode: 400,
            },
            "Invalid end date format. Use YYYY-MM-DD format": {
                message: property_1.PROPERTY_ERROR_MESSAGES.INVALID_END_DATE_FORMAT,
                statusCode: 400,
            },
            "Start date must be before end date": {
                message: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE,
                statusCode: 400,
            },
            "Rate value must be greater than 0": {
                message: property_1.PROPERTY_ERROR_MESSAGES.RATE_VALUE_GREATER_THAN_ZERO,
                statusCode: 400,
            },
            "Percentage rate cannot exceed 1000%": {
                message: property_1.PROPERTY_ERROR_MESSAGES.PERCENTAGE_RATE_LIMIT,
                statusCode: 400,
            },
            "Updated date range would overlap with existing rate rules": {
                message: property_1.PROPERTY_ERROR_MESSAGES.UPDATED_DATE_RANGE_OVERLAP,
                statusCode: 409,
            },
            "Failed to update peak rate": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_UPDATE_PEAK_RATE,
                statusCode: 500,
            },
        };
    }
    /**
     * Get error mappings for remove peak rate operations
     */
    static getRemovePeakRateErrorMappings() {
        return {
            "Room not found": {
                message: property_1.PROPERTY_ERROR_MESSAGES.ROOM_NOT_FOUND,
                statusCode: 404,
            },
            "You don't have permission to manage this room's pricing": {
                message: property_1.PROPERTY_ERROR_MESSAGES.NO_PERMISSION_MANAGE_ROOM_PRICING,
                statusCode: 403,
            },
            "No peak rate found for the specified date": {
                message: property_1.PROPERTY_ERROR_MESSAGES.NO_PEAK_RATE_FOR_DATE,
                statusCode: 404,
            },
            "Invalid date format. Use YYYY-MM-DD format": {
                message: property_1.PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
                statusCode: 400,
            },
            "Failed to remove peak rate": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_REMOVE_PEAK_RATE,
                statusCode: 500,
            },
        };
    }
}
exports.default = PeakRateErrorHelper;
