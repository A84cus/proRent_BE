"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserValidationHelper {
    // Extract and validate user ID from request
    static getUserId(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return {
                isValid: false,
                error: "User not authenticated",
            };
        }
        return {
            isValid: true,
            userId,
        };
    }
    // Validate required fields
    static validateRequiredFields(fields, requiredFields) {
        const missingFields = requiredFields.filter((field) => !fields[field]);
        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
    // Sanitize input data
    static sanitizeInput(data) {
        const sanitized = {};
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                if (typeof data[key] === "string") {
                    sanitized[key] = data[key].trim();
                }
                else {
                    sanitized[key] = data[key];
                }
            }
        });
        return sanitized;
    }
}
exports.default = UserValidationHelper;
