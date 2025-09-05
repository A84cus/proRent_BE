"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampSchema = exports.uuidSchema = exports.sortingSchema = exports.paginationSchema = void 0;
exports.validatePagination = validatePagination;
exports.validateAndSanitizeString = validateAndSanitizeString;
exports.validateEnum = validateEnum;
exports.validateArray = validateArray;
// Central validation index - exports all validation schemas and functions
__exportStar(require("./auth/authValidation"), exports);
__exportStar(require("./user/userValidation"), exports);
__exportStar(require("./upload/uploadValidation"), exports);
__exportStar(require("./property/propertyValidation"), exports);
__exportStar(require("./reservation/reservationValidation"), exports);
__exportStar(require("./review/reviewValidation"), exports);
// Legacy exports for backward compatibility
__exportStar(require("./auth"), exports);
__exportStar(require("./system"), exports);
__exportStar(require("./reservation"), exports);
__exportStar(require("./upload"), exports);
// Common validation utilities
const zod_1 = require("zod");
// Generic validation schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.sortingSchema = zod_1.z.object({
    sortBy: zod_1.z.string().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.uuidSchema = zod_1.z.string().uuid("Invalid UUID format");
exports.timestampSchema = zod_1.z.string().datetime("Invalid timestamp format");
// Generic validation functions
function validatePagination(page, limit) {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 10));
    const offset = (validatedPage - 1) * validatedLimit;
    return {
        page: validatedPage,
        limit: validatedLimit,
        offset,
    };
}
function validateAndSanitizeString(value, fieldName, minLength = 1, maxLength = 255) {
    if (value === null || value === undefined) {
        return {
            isValid: false,
            error: `${fieldName} is required`,
        };
    }
    if (typeof value !== "string") {
        return {
            isValid: false,
            error: `${fieldName} must be a string`,
        };
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters`,
        };
    }
    if (trimmedValue.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} must not exceed ${maxLength} characters`,
        };
    }
    return {
        isValid: true,
        value: trimmedValue,
    };
}
function validateEnum(value, enumValues, fieldName) {
    if (!value) {
        return {
            isValid: false,
            error: `${fieldName} is required`,
        };
    }
    if (!enumValues.includes(value)) {
        return {
            isValid: false,
            error: `${fieldName} must be one of: ${enumValues.join(", ")}`,
        };
    }
    return {
        isValid: true,
        value: value,
    };
}
function validateArray(value, fieldName, minLength = 0, maxLength = 100) {
    if (!Array.isArray(value)) {
        return {
            isValid: false,
            error: `${fieldName} must be an array`,
        };
    }
    if (value.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must contain at least ${minLength} items`,
        };
    }
    if (value.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} must not contain more than ${maxLength} items`,
        };
    }
    return {
        isValid: true,
        value: value,
    };
}
