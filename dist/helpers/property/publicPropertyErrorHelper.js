"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
const library_1 = require("@prisma/client/runtime/library");
class PublicPropertyErrorHelper {
    /**
     * Maps different types of errors for public property operations
     */
    static mapError(error, context) {
        // Handle property not found errors
        if (error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
            return { status: 404, message: error.message };
        }
        // Handle validation errors
        if (error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MIN_PRICE ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MAX_PRICE ||
            error.message ===
                property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_PRICE_GREATER_THAN_MAX ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_TOO_LOW ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MAX_ROOMS_TOO_LOW ||
            error.message ===
                property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_GREATER_THAN_MAX ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_BY ||
            error.message ===
                property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_ORDER_VALUE ||
            error.message ===
                property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PAGE_MUST_BE_AT_LEAST_ONE ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_LIMIT_RANGE ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT ||
            error.message === property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_VALUES ||
            error.message ===
                property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE) {
            return { status: 400, message: error.message };
        }
        // Handle Prisma errors
        if (error instanceof library_1.PrismaClientKnownRequestError) {
            return this.handlePrismaError(error, context);
        }
        // Default error handling based on context
        return this.getDefaultErrorByContext(context);
    }
    /**
     * Handles Prisma-specific errors
     */
    static handlePrismaError(error, context) {
        switch (error.code) {
            case "P2025": // Record not found
                return {
                    status: 404,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
                };
            default:
                return this.getDefaultErrorByContext(context);
        }
    }
    /**
     * Returns default error messages based on operation context
     */
    static getDefaultErrorByContext(context) {
        switch (context) {
            case "search":
                return {
                    status: 500,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.SEARCH_FAILED,
                };
            case "details":
                return {
                    status: 500,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_DETAILS,
                };
            case "calendar":
                return {
                    status: 500,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_CALENDAR_PRICING,
                };
            case "rooms":
                return {
                    status: 500,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_ROOMS,
                };
            default:
                return {
                    status: 500,
                    message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                };
        }
    }
    /**
     * Helper methods for specific error scenarios
     */
    static createValidationError(message) {
        return { status: 400, message };
    }
    static createNotFoundError(message = property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
        return { status: 404, message };
    }
    static createInternalError(message = property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
        return { status: 500, message };
    }
}
exports.default = PublicPropertyErrorHelper;
