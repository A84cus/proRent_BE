"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardInputSchema = exports.DashboardOptionsSchema = exports.DashboardFiltersSchema = void 0;
// src/schemas/report/dashboardSchema.ts
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const DateSchema = zod_1.z.preprocess(arg => {
    if (typeof arg === 'string') {
        return new Date(arg);
    }
    return arg;
}, zod_1.z.date().nullable().optional());
const ReservationStatusSchema = zod_1.z.enum(client_1.Status);
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
    page: zod_1.z.preprocess(val => Number(val), zod_1.z.number().int().min(1).default(1)),
    pageSize: zod_1.z.preprocess(val => Number(val), zod_1.z.number().int().min(1).max(100).default(20)),
    sortBy: zod_1.z.enum(['startDate', 'endDate', 'createdAt', 'paymentAmount']).optional().default('startDate'),
    sortDir: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
});
exports.DashboardInputSchema = zod_1.z.object({
    ownerId: zod_1.z.string().length(12),
    filters: exports.DashboardFiltersSchema.optional().default(() => ({
        propertyId: '',
        roomTypeId: '',
        startDate: null,
        endDate: null,
        status: [],
        search: ''
    })),
    options: exports.DashboardOptionsSchema.optional().default({
        page: 1,
        pageSize: 20,
        sortBy: 'startDate',
        sortDir: 'desc'
    })
});
