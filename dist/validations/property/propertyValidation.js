"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomUpdateSchema = exports.roomCreateSchema = exports.propertyIdSchema = exports.propertyQuerySchema = exports.propertyUpdateSchema = exports.propertyCreateSchema = void 0;
exports.validatePropertyOwnership = validatePropertyOwnership;
exports.validatePropertyLocation = validatePropertyLocation;
exports.validatePriceRange = validatePriceRange;
exports.validateRoomCapacity = validateRoomCapacity;
const zod_1 = require("zod");
// Property validation schemas
exports.propertyCreateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Property name is required")
        .max(200, "Property name must not exceed 200 characters"),
    categoryId: zod_1.z.string().min(1, "Category ID is required"),
    description: zod_1.z
        .string()
        .min(1, "Description is required")
        .max(2000, "Description must not exceed 2000 characters"),
    mainPictureId: zod_1.z.string().min(1, "Main picture ID is required"),
    location: zod_1.z
        .string()
        .min(1, "Location/address is required")
        .max(500, "Location must not exceed 500 characters"),
    city: zod_1.z
        .string()
        .min(1, "City is required")
        .max(100, "City name must not exceed 100 characters"),
    province: zod_1.z
        .string()
        .min(1, "Province is required")
        .max(100, "Province name must not exceed 100 characters"),
    latitude: zod_1.z.string().optional(),
    longitude: zod_1.z.string().optional(),
});
exports.propertyUpdateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Property name is required")
        .max(200, "Property name must not exceed 200 characters")
        .optional(),
    categoryId: zod_1.z.string().min(1, "Category ID is required").optional(),
    description: zod_1.z
        .string()
        .min(1, "Description is required")
        .max(2000, "Description must not exceed 2000 characters")
        .optional(),
    mainPictureId: zod_1.z.string().min(1, "Main picture ID is required").optional(),
    location: zod_1.z
        .string()
        .min(1, "Location/address is required")
        .max(500, "Location must not exceed 500 characters")
        .optional(),
    city: zod_1.z
        .string()
        .min(1, "City is required")
        .max(100, "City name must not exceed 100 characters")
        .optional(),
    province: zod_1.z
        .string()
        .min(1, "Province is required")
        .max(100, "Province name must not exceed 100 characters")
        .optional(),
    latitude: zod_1.z
        .string()
        .refine((val) => {
        if (!val || val.trim() === "")
            return true; // Allow empty/null
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude must be a valid number between -90 and 90")
        .optional(),
    longitude: zod_1.z
        .string()
        .refine((val) => {
        if (!val || val.trim() === "")
            return true; // Allow empty/null
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude must be a valid number between -180 and 180")
        .optional(),
});
exports.propertyQuerySchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1).optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(10).optional(),
    categoryId: zod_1.z.string().min(1, "Category ID is required").optional(),
    city: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    sortBy: zod_1.z
        .enum(["name", "createdAt", "price"])
        .default("createdAt")
        .optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
exports.propertyIdSchema = zod_1.z.string().min(1, "Property ID is required");
// Room validation schemas
exports.roomCreateSchema = zod_1.z.object({
    propertyId: zod_1.z.string().min(1, "Property ID is required"),
    roomType: zod_1.z
        .string()
        .min(1, "Room type is required")
        .max(100, "Room type must not exceed 100 characters"),
    totalRooms: zod_1.z
        .number()
        .int()
        .min(1, "Total rooms must be at least 1")
        .max(1000, "Total rooms must not exceed 1000"),
    price: zod_1.z.number().min(0, "Price must be non-negative"),
    description: zod_1.z
        .string()
        .max(1000, "Room description must not exceed 1000 characters")
        .optional(),
});
exports.roomUpdateSchema = zod_1.z.object({
    roomType: zod_1.z
        .string()
        .min(1, "Room type is required")
        .max(100, "Room type must not exceed 100 characters")
        .optional(),
    totalRooms: zod_1.z
        .number()
        .int()
        .min(1, "Total rooms must be at least 1")
        .max(1000, "Total rooms must not exceed 1000")
        .optional(),
    price: zod_1.z.number().min(0, "Price must be non-negative").optional(),
    description: zod_1.z
        .string()
        .max(1000, "Room description must not exceed 1000 characters")
        .optional(),
});
// Property validation functions
function validatePropertyOwnership(propertyOwnerId, currentUserId) {
    if (propertyOwnerId !== currentUserId) {
        return {
            isValid: false,
            error: "You can only modify your own properties",
        };
    }
    return { isValid: true };
}
function validatePropertyLocation(location, city, province) {
    const errors = [];
    if (!location || location.trim().length === 0) {
        errors.push("Location/address is required");
    }
    if (!city || city.trim().length === 0) {
        errors.push("City is required");
    }
    if (!province || province.trim().length === 0) {
        errors.push("Province is required");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
function validatePriceRange(minPrice, maxPrice) {
    if (minPrice !== undefined && maxPrice !== undefined) {
        if (minPrice > maxPrice) {
            return {
                isValid: false,
                error: "Minimum price cannot be greater than maximum price",
            };
        }
    }
    if (minPrice !== undefined && minPrice < 0) {
        return {
            isValid: false,
            error: "Minimum price cannot be negative",
        };
    }
    if (maxPrice !== undefined && maxPrice < 0) {
        return {
            isValid: false,
            error: "Maximum price cannot be negative",
        };
    }
    return { isValid: true };
}
function validateRoomCapacity(totalRooms, bookedRooms = 0) {
    if (totalRooms < 1) {
        return {
            isValid: false,
            error: "Total rooms must be at least 1",
        };
    }
    if (bookedRooms > totalRooms) {
        return {
            isValid: false,
            error: "Booked rooms cannot exceed total rooms",
        };
    }
    return { isValid: true };
}
