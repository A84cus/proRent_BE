"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyImageUploadSchema = exports.avatarUploadSchema = exports.imageUploadSchema = void 0;
exports.validateFileType = validateFileType;
exports.validateFileSize = validateFileSize;
exports.validateMultipleFiles = validateMultipleFiles;
const zod_1 = require("zod");
// File upload validation schemas
exports.imageUploadSchema = zod_1.z.object({
    mimetype: zod_1.z
        .string()
        .refine((type) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type), "Only JPEG, PNG, and WebP images are allowed"),
    size: zod_1.z.number().max(5 * 1024 * 1024, "File size must not exceed 5MB"),
});
exports.avatarUploadSchema = zod_1.z.object({
    file: zod_1.z.object({
        mimetype: zod_1.z
            .string()
            .refine((type) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type), "Avatar must be JPEG, PNG, or WebP format"),
        size: zod_1.z
            .number()
            .max(2 * 1024 * 1024, "Avatar file size must not exceed 2MB"),
    }),
});
exports.propertyImageUploadSchema = zod_1.z.object({
    files: zod_1.z
        .array(zod_1.z.object({
        mimetype: zod_1.z
            .string()
            .refine((type) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type), "Property images must be JPEG, PNG, or WebP format"),
        size: zod_1.z
            .number()
            .max(10 * 1024 * 1024, "Each property image must not exceed 10MB"),
    }))
        .max(10, "Maximum 10 images allowed per property"),
});
// File validation functions
function validateFileType(file, allowedTypes) {
    if (!file || !file.mimetype) {
        return {
            isValid: false,
            error: "No file provided or invalid file format",
        };
    }
    if (!allowedTypes.includes(file.mimetype)) {
        return {
            isValid: false,
            error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        };
    }
    return { isValid: true };
}
function validateFileSize(file, maxSize) {
    if (!file || !file.size) {
        return {
            isValid: false,
            error: "No file provided or invalid file size",
        };
    }
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            isValid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }
    return { isValid: true };
}
function validateMultipleFiles(files, maxCount, allowedTypes, maxSizePerFile) {
    const errors = [];
    if (!files || files.length === 0) {
        errors.push("No files provided");
        return { isValid: false, errors };
    }
    if (files.length > maxCount) {
        errors.push(`Maximum ${maxCount} files allowed`);
    }
    files.forEach((file, index) => {
        const typeValidation = validateFileType(file, allowedTypes);
        if (!typeValidation.isValid) {
            errors.push(`File ${index + 1}: ${typeValidation.error}`);
        }
        const sizeValidation = validateFileSize(file, maxSizePerFile);
        if (!sizeValidation.isValid) {
            errors.push(`File ${index + 1}: ${sizeValidation.error}`);
        }
    });
    return {
        isValid: errors.length === 0,
        errors,
    };
}
