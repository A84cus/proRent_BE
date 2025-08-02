"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendEmailSchema = exports.testEmailSchema = exports.sendEmailSchema = exports.uploadFileSchema = void 0;
const zod_1 = require("zod");
// Utility validation schemas
exports.uploadFileSchema = zod_1.z.object({
    type: zod_1.z.enum(["profile", "property", "room", "proof"], {
        message: "Type must be one of: profile, property, room, proof",
    }),
    alt: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.sendEmailSchema = zod_1.z
    .object({
    to: zod_1.z.string().email("Invalid email format"),
    subject: zod_1.z.string().min(1, "Subject is required"),
    text: zod_1.z.string().optional(),
    html: zod_1.z.string().optional(),
})
    .refine((data) => data.text || data.html, {
    message: "Either text or html content must be provided",
});
exports.testEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email("Invalid email format"),
    subject: zod_1.z.string().min(1, "Subject is required"),
    type: zod_1.z.enum(["verification", "reset", "welcome", "custom"], {
        message: "Type must be one of: verification, reset, welcome, custom",
    }),
    customHtml: zod_1.z.string().optional(),
});
exports.resendEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    type: zod_1.z.enum(["verification", "reset"], {
        message: "Type must be verification or reset",
    }),
});
