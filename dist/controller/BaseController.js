"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/system/logger"));
const responseHelper_1 = __importDefault(require("../helpers/system/responseHelper"));
const userValidation_1 = require("../validations/user/userValidation");
const property_1 = require("../constants/controllers/property");
class BaseController {
    // Common method untuk validasi user authentication
    validateUser(req) {
        return (0, userValidation_1.validateUserId)(req);
    }
    // Common error handler
    handleError(res, error, operation, specificErrors = {}) {
        logger_1.default.error(`Error in ${operation}:`, error);
        // Handle specific known errors
        if (error.message && specificErrors[error.message]) {
            const specificError = specificErrors[error.message];
            return responseHelper_1.default.error(res, specificError.message, undefined, specificError.statusCode);
        }
        // Default error
        return responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR, undefined, 500);
    }
    // Common authentication error
    handleAuthError(res, error) {
        return responseHelper_1.default.error(res, error, undefined, 401);
    }
    // Common validation error
    handleValidationError(res, error) {
        const message = Array.isArray(error) ? error[0] : error;
        return responseHelper_1.default.error(res, message, Array.isArray(error) ? error : undefined, 400);
    }
    // Common not found error
    handleNotFoundError(res, resource = "Resource") {
        return responseHelper_1.default.error(res, `${resource} not found`, undefined, 404);
    }
    // Common success response
    handleSuccess(res, message, data) {
        return responseHelper_1.default.success(res, message, data);
    }
}
exports.default = BaseController;
