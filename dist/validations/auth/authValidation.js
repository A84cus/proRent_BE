"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordConfirmSchema = exports.resetPasswordRequestSchema = exports.loginSchema = exports.resendVerificationSchema = exports.verifyEmailSchema = exports.registerUserSchema = void 0;
const zod_1 = require("zod");
// Authentication validation schemas
exports.registerUserSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format'),
    role: zod_1.z.enum(['USER', 'OWNER']),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long').optional(),
    socialLogin: zod_1.z.enum(['GOOGLE', 'FACEBOOK', 'TWITTER', 'NONE']).optional()
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z.string().optional() // Make password optional for backward compatibility
});
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format')
});
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.email('Invalid email format'),
    password: zod_1.z.string().optional(),
    socialLogin: zod_1.z.enum(['GOOGLE', 'FACEBOOK', 'TWITTER', 'NONE']).optional()
})
    .refine(data => data.password || (data.socialLogin && data.socialLogin !== 'NONE'), {
    message: 'Either password or social login method must be provided'
});
exports.resetPasswordRequestSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format')
});
exports.resetPasswordConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});
