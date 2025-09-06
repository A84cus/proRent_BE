"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeakRateSchema = exports.updatePeakRateSchema = exports.createPeakRateSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
/**
 * Validation schema for peak rate creation
 */
exports.createPeakRateSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Room ID is required"),
    }),
    body: zod_1.z.object({
        startDate: zod_1.z.string().min(1, "Start date is required").trim(),
        endDate: zod_1.z.string().min(1, "End date is required").trim(),
        rateType: zod_1.z.nativeEnum(client_1.RateType, {
            message: "Rate type must be FIXED or PERCENTAGE",
        }),
        value: zod_1.z.number().positive("Value must be greater than 0"),
        description: zod_1.z
            .string()
            .optional()
            .transform((val) => val === null || val === void 0 ? void 0 : val.trim()),
    }),
});
/**
 * Validation schema for peak rate update
 */
exports.updatePeakRateSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Room ID is required"),
        date: zod_1.z.string().min(1, "Date is required"),
    }),
    body: zod_1.z
        .object({
        startDate: zod_1.z.string().trim().optional(),
        endDate: zod_1.z.string().trim().optional(),
        rateType: zod_1.z.nativeEnum(client_1.RateType).optional(),
        value: zod_1.z.number().positive("Value must be greater than 0").optional(),
        description: zod_1.z
            .string()
            .optional()
            .transform((val) => val === null || val === void 0 ? void 0 : val.trim()),
    })
        .refine((data) => data.startDate !== undefined ||
        data.endDate !== undefined ||
        data.rateType !== undefined ||
        data.value !== undefined ||
        data.description !== undefined, {
        message: "At least one field must be provided for update",
    }),
});
/**
 * Validation schema for peak rate removal
 */
exports.removePeakRateSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Room ID is required"),
        date: zod_1.z.string().min(1, "Date is required"),
    }),
});
