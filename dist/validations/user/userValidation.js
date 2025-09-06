"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRequiredFieldsSchema = exports.userProfileUpdateSchema = exports.userIdSchema = void 0;
exports.validateUserId = validateUserId;
exports.validateRequiredFields = validateRequiredFields;
exports.sanitizeInput = sanitizeInput;
const zod_1 = require("zod");
// User validation schemas
exports.userIdSchema = zod_1.z.string().uuid("Invalid user ID format");
exports.userProfileUpdateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required").optional(),
    lastName: zod_1.z.string().min(1, "Last name is required").optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format")
        .optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    address: zod_1.z.string().min(1, "Address is required").optional(),
    bio: zod_1.z.string().max(500, "Bio must be less than 500 characters").optional(),
});
exports.userRequiredFieldsSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email format"),
});
// User validation functions
function validateUserId(req) {
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
function validateRequiredFields(fields, requiredFields) {
    const missingFields = requiredFields.filter((field) => !fields[field]);
    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
}
function sanitizeInput(data) {
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
