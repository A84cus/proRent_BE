"use strict";
// src/services/report/dashboard/getOwnerDashboardReport.ts
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
exports.getPeriodConfig = getPeriodConfig;
exports.getOwnerDashboardReport = getOwnerDashboardReport;
const dashboardSchema_1 = require("../../validations/report/dashboardSchema");
const cronjobValidationService_1 = require("./cronJob/cronjobValidationService");
const buildPeriodConfig_1 = require("./utils/buildPeriodConfig");
const unifiedReport_1 = require("./unifiedReport"); // ✅ New unified handler
/**
 * Legacy fallback (optional) – can be removed after migration
 */
const Fallback = {
    fallbackResponse() {
        return {
            properties: [],
            summary: {
                Global: {
                    totalActiveBookings: 0,
                    totalActualRevenue: 0,
                    totalProperties: 0,
                    totalProjectedRevenue: 0
                },
                Aggregate: {
                    counts: { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
                    revenue: { actual: 0, projected: 0, average: 0 }
                },
                period: { startDate: null, endDate: null },
                pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 }
            }
        };
    }
};
function getPeriodConfig(startDate, endDate) {
    return (0, buildPeriodConfig_1.buildPeriodConfig)(startDate || null, endDate || null);
}
/**
 * Main entry point for owner dashboard report
 */
function getOwnerDashboardReport(ownerId_1, filters_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, filters, options = {}, period) {
        var _a, _b, _c, _d;
        // 🔹 Normalize period
        const effectivePeriod = {
            startDate: (_b = (_a = filters.startDate) !== null && _a !== void 0 ? _a : period === null || period === void 0 ? void 0 : period.startDate) !== null && _b !== void 0 ? _b : null,
            endDate: (_d = (_c = filters.endDate) !== null && _c !== void 0 ? _c : period === null || period === void 0 ? void 0 : period.endDate) !== null && _d !== void 0 ? _d : null
        };
        // 🔹 Validate input
        const result = dashboardSchema_1.DashboardInputSchema.safeParse({
            ownerId,
            filters,
            options,
            period: effectivePeriod,
            periodConfig: (0, buildPeriodConfig_1.buildPeriodConfig)(effectivePeriod.startDate, effectivePeriod.endDate)
        });
        if (!result.success) {
            throw new Error(result.error.issues
                .map(err => {
                const path = err.path.length > 0 ? err.path.join('.') : 'input';
                return `${path}: ${err.message}`;
            })
                .join('; '));
        }
        const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = result.data;
        // 🔐 Ownership validation
        if (validatedFilters.propertyId) {
            yield (0, cronjobValidationService_1.validatePropertyOwnership)(validatedOwnerId, validatedFilters.propertyId);
        }
        if (validatedFilters.roomTypeId && validatedFilters.propertyId) {
            yield (0, cronjobValidationService_1.validateRoomTypeOwnership)(validatedOwnerId, validatedFilters.roomTypeId);
        }
        // 📅 Build period & context
        const periodConfig = (0, buildPeriodConfig_1.buildPeriodConfig)(effectivePeriod.startDate, effectivePeriod.endDate);
        const context = {
            ownerId: validatedOwnerId,
            filters: validatedFilters,
            options: validatedOptions,
            period: effectivePeriod,
            periodConfig
        };
        try {
            // ✅ Use unified report for all cases
            return yield (0, unifiedReport_1.handleUnifiedReport)(context);
        }
        catch (error) {
            console.error('Error in handleUnifiedReport:', error);
            return Fallback.fallbackResponse();
        }
    });
}
