"use strict";
// src/services/report/dashboard/cases/case1_noProperty.ts
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
const prisma_1 = __importDefault(require("../../../prisma"));
const aggregateSummaries_1 = require("../utils/aggregateSummaries");
const PerformanceSummaryService_1 = require("../PerformanceSummaryService");
const customReportService_1 = require("../customReportService");
function handleCase1(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerId, filters, options, period, periodConfig } = context;
        const { page = 1, pageSize = 20 } = options;
        const { periodType, periodKey, year, month } = periodConfig;
        // Try cache
        const cachedSummaries = yield prisma_1.default.propertyPerformanceSummary.findMany({
            where: { property: { OwnerId: ownerId }, periodType, periodKey },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        mainPicture: true,
                        location: { select: { address: true, city: { select: { name: true } } } }
                    }
                }
            }
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
            const combined = (0, aggregateSummaries_1.aggregateSummaries)(properties.map(p => p.summary));
            const totalCount = yield prisma_1.default.property.count({ where: { OwnerId: ownerId } });
            const totalPages = Math.ceil(totalCount / pageSize);
            return { properties, summary: combined, period, pagination: { page, pageSize, total: totalCount, totalPages } };
        }
        // Cache miss
        const totalCount = yield prisma_1.default.property.count({ where: { OwnerId: ownerId } });
        const totalPages = Math.ceil(totalCount / pageSize);
        const skip = (page - 1) * pageSize;
        const properties = yield prisma_1.default.property.findMany({
            where: { OwnerId: ownerId },
            skip,
            take: pageSize,
            orderBy: { name: 'asc' },
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
