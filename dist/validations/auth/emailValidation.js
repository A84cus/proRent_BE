"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationSchema = exports.emailChangeSchema = exports.emailVerificationSchema = exports.emailSchema = void 0;
exports.validateEmailFormat = validateEmailFormat;
exports.validateEmailChangeRequest = validateEmailChangeRequest;
const zod_1 = require("zod");
// Email validation schemas
exports.emailSchema = zod_1.z.string().email("Invalid email format");
exports.emailVerificationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Verification token is required"),
});
exports.emailChangeSchema = zod_1.z
    .object({
    newEmail: exports.emailSchema,
    confirmEmail: exports.emailSchema,
})
    .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Email and confirmation email don't match",
    path: ["confirmEmail"],
});
exports.resendVerificationSchema = zod_1.z.object({
    email: exports.emailSchema,
});
// Email validation functions
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validateEmailChangeRequest(newEmail, currentEmail) {
    const errors = [];
    if (!newEmail) {
        errors.push("New email is required");
        return { isValid: false, errors };
    }
    if (!validateEmailFormat(newEmail)) {
        errors.push("Invalid email format");
    }
    if (currentEmail === newEmail) {
        errors.push("New email must be different from current email");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
