"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardInputSchema = exports.DashboardOptionsSchema = exports.DashboardFiltersSchema = void 0;
// src/schemas/report/dashboardSchema.ts
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const DateSchema = zod_1.z
    .union([zod_1.z.string().trim(), zod_1.z.date(), zod_1.z.null(), zod_1.z.undefined()])
    .transform((arg) => {
    if (arg === null || arg === undefined || arg === '') {
        return null;
    }
    if (arg instanceof Date) {
        return isNaN(arg.getTime()) ? null : arg;
    }
    if (typeof arg === 'string') {
        const date = new Date(arg);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
})
    .nullable()
    .optional();
const ReservationStatusSchema = zod_1.z.enum(client_1.Status);
const ReservationPageInputSchema = zod_1.z
    .union([zod_1.z.number().int().min(1), zod_1.z.record(zod_1.z.string().min(1), zod_1.z.number().int().min(1))])
    .optional()
    .default(1);
exports.DashboardFiltersSchema = zod_1.z.object({
    propertyId: zod_1.z.string().length(12).optional(),
    roomTypeId: zod_1.z.string().length(12).optional(),
    startDate: DateSchema,
    endDate: DateSchema,
    status: zod_1.z.array(ReservationStatusSchema).optional(),
    search: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional()
        .transform(s => s === null || s === void 0 ? void 0 : s.toLowerCase())
});
exports.DashboardOptionsSchema = zod_1.z.object({
    page: zod_1.z.preprocess(val => {
        if (val === undefined || val === null || val === '') {
            return undefined;
        }
        const num = Number(val);
        return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : num;
    }, zod_1.z.number().int().min(1).default(1)),
    pageSize: zod_1.z.preprocess(val => {
        if (val === undefined || val === null || val === '') {
            return undefined;
        }
        const num = Number(val);
        return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : Math.min(num, 100);
    }, zod_1.z.number().int().min(1).max(100).default(20)),
    sortBy: zod_1.z.enum(['startDate', 'endDate', 'createdAt', 'paymentAmount']).optional().default('startDate'),
    sortDir: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    reservationPage: ReservationPageInputSchema,
    reservationPageSize: zod_1.z.preprocess(val => {
        if (val === undefined || val === null || val === '') {
            return undefined;
        }
        const num = Number(val);
        return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : Math.min(num, 100);
    }, zod_1.z.number().int().min(1).max(100).default(10)),
    fetchAllData: zod_1.z.preprocess(val => {
        // Handle string "true"/"false" from query params robustly
        if (typeof val === 'string') {
            const lowerVal = val.toLowerCase();
            if (lowerVal === 'true') {
                return true;
            }
            if (lowerVal === 'false' || lowerVal === '') {
                return false;
            }
        }
        // Handle boolean values directly
        if (typeof val === 'boolean') {
            return val;
        }
        // Default or invalid value
        return undefined;
    }, zod_1.z.boolean().optional().default(false))
});
exports.DashboardInputSchema = zod_1.z.object({
    ownerId: zod_1.z.string().length(12),
    filters: exports.DashboardFiltersSchema.optional().default(() => ({
        propertyId: '',
        roomTypeId: '',
        startDate: undefined,
        endDate: undefined,
        status: [],
        search: ''
    })),
    options: exports.DashboardOptionsSchema.optional().default({
        page: 1,
        pageSize: 20,
        reservationPage: 1,
        reservationPageSize: 10,
        sortBy: 'startDate',
        sortDir: 'desc',
        fetchAllData: false
    })
});
