"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
const library_1 = require("@prisma/client/runtime/library");
class PropertyErrorHelper {
    /**
     * Maps different types of errors for property operations
     */
    static mapError(error, context) {
        // Handle authentication errors
        if (error.message === property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED) {
            return { status: 401, message: error.message };
        }
        // Handle property not found errors
        if (error.message === property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
            return { status: 404, message: error.message };
        }
        if (error.message ===
            property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND_OR_NO_PERMISSION) {
            return { status: 404, message: error.message };
        }
        // Handle validation errors
        if (error.message === property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.LOCATION_ADDRESS_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.CITY_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_REQUIRED ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.UPDATE_FIELDS_REQUIRED ||
            error.message ===
                property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_MUST_BE_STRING ||
            error.message ===
                property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_NON_EMPTY_STRING ||
            error.message ===
                property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_MUST_BE_STRING ||
            error.message ===
                property_1.PROPERTY_ERROR_MESSAGES.LOCATION_MUST_BE_NON_EMPTY_STRING ||
            error.message === property_1.PROPERTY_ERROR_MESSAGES.CITY_MUST_BE_NON_EMPTY_STRING ||
            error.message ===
                property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_MUST_BE_NON_EMPTY_STRING) {
            return { status: 400, message: error.message };
        }
        // Handle category not found
        if (error.message === property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND) {
            return { status: 404, message: error.message };
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
            case "P2002": // Unique constraint violation
                return {
                    status: 409,
                    message: "A property with this information already exists",
                };
            case "P2025": // Record not found
                return {
                    status: 404,
                    message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
                };
            case "P2003": // Foreign key constraint violation
                if (context === "create" || context === "update") {
                    return {
                        status: 400,
                        message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
                    };
                }
                return {
                    status: 400,
                    message: "Invalid reference to related data",
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
            case "fetch":
                return {
                    status: 500,
                    message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_PROPERTIES,
                };
            case "fetchById":
                return {
                    status: 500,
                    message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_PROPERTY,
                };
            case "create":
                return {
                    status: 500,
                    message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_CREATION_FAILED,
                };
            case "update":
                return {
                    status: 500,
                    message: "Failed to update property",
                };
            case "delete":
                return {
                    status: 500,
                    message: "Failed to delete property",
                };
            default:
                return {
                    status: 500,
                    message: property_1.PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                };
        }
    }
    /**
     * Helper methods for specific error scenarios
     */
    static createValidationError(message) {
        return { status: 400, message };
    }
    static createNotFoundError(message = property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
        return { status: 404, message };
    }
    static createUnauthorizedError(message = property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED) {
        return { status: 401, message };
    }
    static createInternalError(message = property_1.PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
        return { status: 500, message };
    }
}
exports.default = PropertyErrorHelper;
