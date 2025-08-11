"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseHelper {
    // Success response
    static success(res, message, data, statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }
    // Error response
    static error(res, message, errors, statusCode = 400) {
        const response = {
            success: false,
            message,
            errors,
        };
        return res.status(statusCode).json(response);
    }
    // Paginated response
    static paginated(res, message, data, pagination, statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            pagination,
        };
        return res.status(statusCode).json(response);
    }
    // File upload success response
    static uploadSuccess(res, fileData) {
        return this.success(res, "File uploaded successfully", fileData, 200);
    }
    // File deletion success response
    static deleteSuccess(res) {
        return this.success(res, "File deleted successfully", undefined, 200);
    }
    // Validation error response
    static validationError(res, errors) {
        return this.error(res, "Validation failed", errors, 400);
    }
    // Not found response
    static notFound(res, resource = "Resource") {
        return this.error(res, `${resource} not found`, undefined, 404);
    }
    // Unauthorized response
    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, message, undefined, 401);
    }
    // Server error response
    static serverError(res, message = "Internal server error") {
        return this.error(res, message, undefined, 500);
    }
    // Bad request response
    static badRequest(res, message, errors) {
        return this.error(res, message, errors, 400);
    }
}
exports.default = ResponseHelper;
