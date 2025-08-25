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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCase1 = handleCase1;
// src/services/report/dashboard/cases/case1_noProperty.ts
const prisma_1 = __importDefault(require("../../../prisma"));
const aggregateSummaries_1 = require("../utils/aggregateSummaries");
const PerformanceSummaryService_1 = require("../PerformanceSummaryService");
const customReportService_1 = require("../customReportService");
function handleCase1(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerId, filters, options, period, periodConfig } = context;
        const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options; // Extract sorting options
        const { search } = filters; // Extract search filter
        const { periodType, periodKey, year, month } = periodConfig;
        // --- Map sortBy option to PropertyPerformanceSummary field ---
        let summaryOrderByClause = { property: { name: sortDir } }; // Default fallback
        switch (sortBy) {
            case 'paymentAmount':
                summaryOrderByClause = { totalRevenue: sortDir }; // Sort by cached revenue
                break;
            case 'startDate':
            case 'endDate':
            case 'createdAt':
                // These don't directly map to PropertyPerformanceSummary fields.
                // Sorting by creation date of summary might be closest for 'createdAt'.
                // For 'startDate'/'endDate', sorting by revenue or name is often acceptable default.
                console.warn(`Sorting by ${sortBy} not directly supported on PropertyPerformanceSummary. Falling back to name.`);
                summaryOrderByClause = { property: { name: sortDir } };
                break;
            // Add cases for fields that exist on Property model if needed (e.g., if you add a createdAt to Property)
            default:
                summaryOrderByClause = { property: { name: sortDir } }; // Default to name
        }
        // --- Build search filter for PropertyPerformanceSummary query ---
        const propertySearchFilter = {
            property: { OwnerId: ownerId },
            periodType,
            periodKey
        };
        if (search) {
            propertySearchFilter.property.name = {
                contains: search,
                mode: 'insensitive' // Case-insensitive search
            };
            // If you want to search address/city, you'd need to adjust the query structure or use raw SQL
            // as Prisma's nested filtering can become complex for OR conditions across different relations.
            // For simplicity, this example focuses on property name.
        }
        // Try cache - Apply sorting and search filtering here
        const cachedSummaries = yield prisma_1.default.propertyPerformanceSummary.findMany({
            where: propertySearchFilter,
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        mainPicture: true,
                        location: { select: { address: true, city: { select: { name: true } } } }
                    }
                }
            },
            orderBy: summaryOrderByClause, // <-- Use dynamic sorting
            skip: (page - 1) * pageSize,
            take: pageSize
        });
        if (cachedSummaries.length > 0) {
            const properties = cachedSummaries.map(s => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    property: {
                        id: s.property.id,
                        name: s.property.name,
                        Picture: (_b = (_a = s.property.mainPicture) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : null,
                        address: (_d = (_c = s.property.location) === null || _c === void 0 ? void 0 : _c.address) !== null && _d !== void 0 ? _d : null,
                        city: (_f = (_e = s.property.location) === null || _e === void 0 ? void 0 : _e.city.name) !== null && _f !== void 0 ? _f : null
                    },
                    period,
                    summary: {
                        counts: {
                            PENDING_PAYMENT: s.pendingPaymentCount,
                            PENDING_CONFIRMATION: s.pendingConfirmationCount,
                            CONFIRMED: s.confirmedCount,
                            CANCELLED: s.cancelledCount
                        },
                        revenue: {
                            actual: Number(s.totalRevenue),
                            projected: Number(s.projectedRevenue),
                            average: s.confirmedCount > 0 ? Number(s.totalRevenue) / s.confirmedCount : 0
                        }
                    }
                });
            });
            // Important: Get the total count matching the search criteria for accurate pagination
            const totalCount = yield prisma_1.default.propertyPerformanceSummary.count({
                where: propertySearchFilter
            });
            const totalPages = Math.ceil(totalCount / pageSize);
            const combined = (0, aggregateSummaries_1.aggregateSummaries)(properties.map(p => p.summary));
            return {
                properties,
                summary: combined,
                period,
                pagination: { page, pageSize, total: totalCount, totalPages }
            };
        }
        // Cache miss - Proceed with fetching and calculating (less efficient)
        // Note: This path might also need to apply search/sorting if critical.
        const propertyBaseFilter = { OwnerId: ownerId };
        if (search) {
            propertyBaseFilter.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        const totalCount = yield prisma_1.default.property.count({
            where: propertyBaseFilter
        });
        const totalPages = Math.ceil(totalCount / pageSize);
        const skip = (page - 1) * pageSize;
        // On cache miss, fetch properties with search and basic sorting
        const properties = yield prisma_1.default.property.findMany({
            where: propertyBaseFilter,
            skip,
            take: pageSize,
            orderBy: { name: 'asc' }, // Basic sorting on cache miss, could be improved
            select: {
                id: true,
                name: true,
                mainPicture: true,
                location: { select: { address: true, city: { select: { name: true } } } }
            }
        });
        const propertySummaries = yield Promise.all(properties.map((prop) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const report = yield (0, customReportService_1.getReservationReport)(Object.assign({ ownerId, propertyId: prop.id }, filters), { page: 1, pageSize: 1000 });
            yield (0, PerformanceSummaryService_1.upsertPropertyPerformanceSummary)(Object.assign(Object.assign({ propertyId: prop.id }, periodConfig), { totalRevenue: report.summary.revenue.actual, projectedRevenue: report.summary.revenue.projected, totalReservations: report.summary.totalReservations, confirmedCount: report.summary.counts.CONFIRMED, pendingPaymentCount: report.summary.counts.PENDING_PAYMENT, pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION, cancelledCount: report.summary.counts.CANCELLED, uniqueUsers: new Set(report.data.map(r => r.userId)).size, OwnerId: ownerId }));
            return {
                property: {
                    id: prop.id,
                    name: prop.name,
                    Picture: (_b = (_a = prop.mainPicture) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : null,
                    address: (_d = (_c = prop.location) === null || _c === void 0 ? void 0 : _c.address) !== null && _d !== void 0 ? _d : null,
                    city: (_f = (_e = prop.location) === null || _e === void 0 ? void 0 : _e.city.name) !== null && _f !== void 0 ? _f : null
                },
                period,
                summary: report.summary
            };
        })));
        const combined = (0, aggregateSummaries_1.aggregateSummaries)(propertySummaries.map(p => p.summary));
        return {
            properties: propertySummaries,
            summary: combined,
            period,
            pagination: { page, pageSize, total: totalCount, totalPages }
        };
    });
}
