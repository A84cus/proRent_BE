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
const cases_1 = require("./cases");
const cronjobValidationService_1 = require("./cronJob/cronjobValidationService");
const buildPeriodConfig_1 = require("./utils/buildPeriodConfig");
function getPeriodConfig(startDate, endDate) {
    if (!startDate || !endDate) {
        const now = new Date();
        return {
            periodType: 'YEARLY',
            periodKey: now.getFullYear().toString(),
            year: now.getFullYear(),
            month: null
        };
    }
    const year = startDate.getFullYear();
    return {
        periodType: 'YEARLY',
        periodKey: year.toString(),
        year,
        month: null
    };
}
function getOwnerDashboardReport(ownerId_1, filters_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, filters, options = {}, period) {
        var _a, _b;
        const result = dashboardSchema_1.DashboardInputSchema.safeParse({
            ownerId,
            filters,
            options,
            period: {
                startDate: filters.startDate || null,
                endDate: filters.endDate || null
            },
            periodConfig: getPeriodConfig(filters.startDate || undefined, filters.endDate || undefined)
        });
        if (result.success) {
            const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = result.data;
            const { propertyId, roomTypeId } = validatedFilters;
            if (propertyId) {
                yield (0, cronjobValidationService_1.validatePropertyOwnership)(validatedOwnerId, propertyId);
            }
            if (roomTypeId && propertyId) {
                yield (0, cronjobValidationService_1.validateRoomTypeOwnership)(validatedOwnerId, roomTypeId);
            }
            const period = {
                startDate: (_a = validatedFilters.startDate) !== null && _a !== void 0 ? _a : null,
                endDate: (_b = validatedFilters.endDate) !== null && _b !== void 0 ? _b : null
            };
            const periodConfig = (0, buildPeriodConfig_1.buildPeriodConfig)(period.startDate, period.endDate);
            const context = {
                ownerId: validatedOwnerId,
                filters: validatedFilters,
                options: validatedOptions,
                period,
                periodConfig
            };
            if (!propertyId) {
                return yield cases_1.caseNoParam.handleCase1(context);
            }
            if (propertyId && !roomTypeId) {
                return yield cases_1.caseProperty.handleCase2(context);
            }
            if (propertyId && roomTypeId) {
                return yield cases_1.caseRoomType.handleCase3(context);
            }
            return cases_1.Fallback.fallbackResponse();
        }
        throw new Error(result.error.issues
            .map(err => {
            const path = err.path.length > 0 ? err.path.join('.') : 'input';
            return `${path}: ${err.message}`;
        })
            .join('; '));
    });
}
