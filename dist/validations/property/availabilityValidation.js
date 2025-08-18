"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyAvailabilitySchema = exports.setBulkAvailabilitySchema = exports.availabilityItemSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for a single availability item
 */
exports.availabilityItemSchema = zod_1.z.object({
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    isAvailable: zod_1.z.boolean(),
});
/**
 * Validation schema for bulk availability setting
 */
exports.setBulkAvailabilitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Room ID is required"),
    }),
    body: zod_1.z.object({
        availability: zod_1.z
            .array(exports.availabilityItemSchema)
            .min(1, "Availability array cannot be empty"),
    }),
});
/**
 * Validation schema for monthly availability query
 */
exports.getMonthlyAvailabilitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Room ID is required"),
    }),
    query: zod_1.z.object({
        month: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
            .refine((month) => {
            const [yearStr, monthStr] = month.split("-");
            const year = parseInt(yearStr, 10);
            const monthNum = parseInt(monthStr, 10);
            return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
        }, "Invalid year or month range"),
    }),
});
