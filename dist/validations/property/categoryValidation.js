"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategorySchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for category creation
 */
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Category name is required").trim(),
        description: zod_1.z
            .string()
            .optional()
            .transform((val) => (val === null || val === void 0 ? void 0 : val.trim()) || undefined),
    }),
});
/**
 * Validation schema for category update
 */
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Category ID is required"),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(1, "Category name cannot be empty")
            .trim()
            .optional(),
        description: zod_1.z
            .string()
            .optional()
            .transform((val) => (val === null || val === void 0 ? void 0 : val.trim()) || undefined),
    })
        .refine((data) => data.name !== undefined || data.description !== undefined, {
        message: "At least one field (name or description) must be provided",
    }),
});
/**
 * Validation schema for category deletion
 */
exports.deleteCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Category ID is required"),
    }),
});
