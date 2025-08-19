"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetConfirmSchema = exports.passwordResetRequestSchema = exports.passwordChangeSchema = exports.passwordSchema = void 0;
exports.validatePasswordStrength = validatePasswordStrength;
const zod_1 = require("zod");
// Password validation schemas
exports.passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)");
exports.passwordChangeSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Password confirmation is required"),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password don't match",
    path: ["confirmPassword"],
});
exports.passwordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
exports.passwordResetConfirmSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    newPassword: exports.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Password confirmation is required"),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password and confirmation password don't match",
    path: ["confirmPassword"],
});
// Password strength validation function
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push("Password must contain at least one special character (@$!%*?&)");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
