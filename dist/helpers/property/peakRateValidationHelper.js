"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const property_1 = require("../../constants/controllers/property");
class PeakRateValidationHelper {
    /**
     * Validate room ID parameter
     */
    static validateRoomId(id) {
        if (!id) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.ROOM_ID_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate date parameter
     */
    static validateDate(date) {
        if (!date) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DATE_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate peak rate creation data
     */
    static validateCreatePeakRateData(data) {
        const { startDate, endDate, rateType, value, description } = data;
        // Validate startDate
        if (!startDate || typeof startDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_REQUIRED,
            };
        }
        // Validate endDate
        if (!endDate || typeof endDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.END_DATE_REQUIRED,
            };
        }
        // Validate rateType
        if (!rateType || !Object.values(client_1.RateType).includes(rateType)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.RATE_TYPE_REQUIRED,
            };
        }
        // Validate value
        if (!value || typeof value !== "number") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.VALUE_REQUIRED,
            };
        }
        // Validate description (optional)
        if (description !== undefined && typeof description !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
            };
        }
        const peakRateData = {
            startDate: startDate.trim(),
            endDate: endDate.trim(),
            rateType: rateType,
            value: Number(value),
            description: description === null || description === void 0 ? void 0 : description.trim(),
        };
        return {
            isValid: true,
            data: peakRateData,
        };
    }
    /**
     * Validate peak rate update data
     */
    static validateUpdatePeakRateData(data) {
        const { startDate, endDate, rateType, value, description } = data;
        // Check if at least one field is provided
        if (startDate === undefined &&
            endDate === undefined &&
            rateType === undefined &&
            value === undefined &&
            description === undefined) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.UPDATE_PEAK_RATE_FIELDS_REQUIRED,
            };
        }
        // Validate startDate if provided
        if (startDate !== undefined && typeof startDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_STRING_FORMAT,
            };
        }
        // Validate endDate if provided
        if (endDate !== undefined && typeof endDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.END_DATE_STRING_FORMAT,
            };
        }
        // Validate rateType if provided
        if (rateType !== undefined && !Object.values(client_1.RateType).includes(rateType)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.RATE_TYPE_FIXED_OR_PERCENTAGE,
            };
        }
        // Validate value if provided
        if (value !== undefined && typeof value !== "number") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.VALUE_MUST_BE_NUMBER,
            };
        }
        // Validate description if provided
        if (description !== undefined && typeof description !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
            };
        }
        const updateData = {};
        if (startDate !== undefined)
            updateData.startDate = startDate.trim();
        if (endDate !== undefined)
            updateData.endDate = endDate.trim();
        if (rateType !== undefined)
            updateData.rateType = rateType;
        if (value !== undefined)
            updateData.value = Number(value);
        if (description !== undefined)
            updateData.description = description.trim();
        return {
            isValid: true,
            data: updateData,
        };
    }
    /**
     * Validate start date field specifically
     */
    static validateStartDateField(startDate) {
        if (!startDate || typeof startDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.START_DATE_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate end date field specifically
     */
    static validateEndDateField(endDate) {
        if (!endDate || typeof endDate !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.END_DATE_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate rate type field specifically
     */
    static validateRateTypeField(rateType) {
        if (!rateType || !Object.values(client_1.RateType).includes(rateType)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.RATE_TYPE_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate value field specifically
     */
    static validateValueField(value) {
        if (!value || typeof value !== "number") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.VALUE_REQUIRED,
            };
        }
        return { isValid: true };
    }
}
exports.default = PeakRateValidationHelper;
