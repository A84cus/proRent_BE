"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardReportController = void 0;
const reportDashboardService_1 = require("../../service/report/reportDashboardService");
const paymentProofController_1 = require("../reservationController/paymentProofController");
const dashboardSchema_1 = require("../../validations/report/dashboardSchema");
function parseDate(value) {
    if (typeof value !== 'string') {
        return undefined;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
}
// Helper: Parse reservationPage safely
function parseReservationPage(value) {
    if (value === undefined || value === null || value === '') {
        return 1;
    }
    // Case 1: Already a number string
    if (typeof value === 'string') {
        const num = Number(value);
        if (!isNaN(num) && Number.isInteger(num) && num >= 1) {
            return num;
        }
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1) {
                return parsed;
            }
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                for (const key in parsed) {
                    const v = parsed[key];
                    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) {
                        console.warn('Invalid page value in reservationPage:', { key, value: v });
                        return 1;
                    }
                }
                return parsed;
            }
        }
        catch (e) {
            console.warn('Failed to parse reservationPage JSON:', value);
            return 1;
        }
    }
    if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
        return value;
    }
    return 1;
}
// Helper: Parse reservationPageSize
function parseReservationPageSize(value) {
    const num = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
    if (isNaN(num) || !Number.isInteger(num) || num < 1) {
        return 10;
    }
    return Math.min(num, 100);
}
const dashboardReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // --- 1. Extract ownerId ---
        const ownerId = (0, paymentProofController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // --- 2. Parse query params safely ---
        const { propertyId, roomTypeId, startDate, endDate, status, search, page, pageSize, sortBy, sortDir, reservationPageSize: rawReservationPageSize, reservationPage: rawReservationPage } = req.query;
        const isValidStatus = (s) => {
            return ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'].includes(s);
        };
        const filters = {
            propertyId: typeof propertyId === 'string' ? propertyId : undefined,
            roomTypeId: typeof roomTypeId === 'string' ? roomTypeId : undefined,
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
            status: Array.isArray(status)
                ? status.filter((s) => typeof s === 'string').filter(isValidStatus)
                : typeof status === 'string' && isValidStatus(status)
                    ? [status]
                    : [],
            search: typeof search === 'string' ? search : undefined
        };
        const optionsBase = {
            page: typeof page === 'string' ? Math.max(1, parseInt(page, 10)) : 1,
            pageSize: typeof pageSize === 'string' ? Math.max(1, Math.min(100, parseInt(pageSize, 10))) : 20,
            sortBy: ['startDate', 'endDate', 'createdAt', 'paymentAmount'].includes(sortBy)
                ? sortBy
                : 'startDate',
            sortDir: sortDir === 'asc' ? 'asc' : 'desc',
            reservationPage: parseReservationPage(rawReservationPage),
            reservationPageSize: parseReservationPageSize(rawReservationPageSize)
            // fetchAllData will be added separately
        };
        const typedSortDir = sortDir === 'asc' ? 'asc' : 'desc';
        // --- Explicitly and safely extract fetchAllData ---
        let fetchAllDataValue;
        const rawQueryFetchAllData = req.query.fetchAllData;
        if (typeof rawQueryFetchAllData === 'string') {
            // IMPORTANT: Remove surrounding quotes if they exist.
            // This handles cases where the value might be "\"true\"" or "\"false\""
            let cleanValue = rawQueryFetchAllData.trim();
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"') && cleanValue.length > 1) {
                cleanValue = cleanValue.substring(1, cleanValue.length - 1);
            }
            if (cleanValue.startsWith("'") && cleanValue.endsWith("'") && cleanValue.length > 1) {
                cleanValue = cleanValue.substring(1, cleanValue.length - 1);
            }
            // Assign the cleaned string value. Zod's preprocess will handle conversion.
            fetchAllDataValue = cleanValue;
        }
        else if (typeof rawQueryFetchAllData === 'boolean') {
            // If it somehow arrives as a boolean, pass it through.
            fetchAllDataValue = rawQueryFetchAllData;
        }
        // Construct the final options object for Zod
        const options = {
            page: typeof page === 'string' ? Math.max(1, parseInt(page, 10)) : 1,
            pageSize: typeof pageSize === 'string' ? Math.max(1, Math.min(100, parseInt(pageSize, 10))) : 20,
            sortBy: ['startDate', 'endDate', 'createdAt', 'paymentAmount'].includes(sortBy)
                ? sortBy
                : 'startDate',
            // Use the explicitly typed variable
            sortDir: typedSortDir,
            reservationPage: parseReservationPage(rawReservationPage),
            reservationPageSize: parseReservationPageSize(rawReservationPageSize),
            fetchAllData: fetchAllDataValue // From previous logic
        };
        // Validate full input with Zod (this ensures type safety)
        const validatedInput = dashboardSchema_1.DashboardInputSchema.safeParse({
            ownerId,
            filters,
            options
        });
        if (!validatedInput.success) {
            console.warn('Validation failed:', validatedInput.error.flatten());
            res.status(400).json({
                error: 'Invalid request parameters',
                details: validatedInput.error.flatten()
            });
            return;
        }
        const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = validatedInput.data;
        // --- 3. Call service ---
        const period = {
            startDate: validatedFilters.startDate || null,
            endDate: validatedFilters.endDate || null
        };
        const report = yield (0, reportDashboardService_1.getOwnerDashboardReport)(validatedOwnerId, validatedFilters, validatedOptions, period);
        res.status(200).json(report);
    }
    catch (error) {
        console.error('Error in dashboardReportController:', error);
        if (error.message.includes('Invalid ID') || error.message.includes('Invalid element')) {
            res.status(400).json({
                error: 'Invalid request',
                details: error.message
            });
            return;
        }
        if (error.message.includes('not found or not owned') || error.message.includes('Access denied')) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.status(500).json({
            error: 'Failed to generate dashboard report',
            details: error.message
        });
    }
});
exports.dashboardReportController = dashboardReportController;
