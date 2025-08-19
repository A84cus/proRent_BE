"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentProofFileSchema = void 0;
// src/validations/paymentProofSchema.ts
const zod_1 = require("zod");
exports.paymentProofFileSchema = zod_1.z.object({
    originalname: zod_1.z
        .string()
        .min(1, { message: 'Filename is required.' })
        .refine(filename => {
        var _a;
        const ext = (_a = filename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        return ext && ['jpg', 'jpeg', 'png'].includes(ext);
    }, { message: 'Invalid file type. Only .jpg, .jpeg, and .png files are allowed for payment proofs.' }),
    size: zod_1.z
        .number()
        .int()
        .positive({ message: 'File size must be a positive number.' })
        .max(1 * 1024 * 1024, { message: 'File size exceeds the maximum allowed size of 1MB.' }), // 1MB
    alt: zod_1.z.string().optional(),
    type: zod_1.z.literal('proof').optional()
});
