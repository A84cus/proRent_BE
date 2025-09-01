"use strict";
// src/services/report/dashboard/utils/buildContextFromRequest.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContextFromRequest = buildContextFromRequest;
const buildPeriodConfig_1 = require("./utils/buildPeriodConfig");
function buildContextFromRequest(req, ownerId) {
    var _a, _b;
    const query = req.query;
    const filters = {
        propertyId: query.propertyId || undefined,
        roomTypeId: query.roomTypeId || undefined,
        propertySearch: query.propertySearch || undefined,
        city: query.city || undefined,
        province: query.province || undefined,
        roomTypeSearch: query.roomTypeSearch || undefined,
        customerName: query.customerName || undefined,
        email: query.email || undefined,
        invoiceNumber: query.invoiceNumber || undefined,
        reservationStatus: query.reservationStatus || undefined,
        startDate: query.startDate ? new Date(query.startDate) : null,
        endDate: query.endDate ? new Date(query.endDate) : null
    };
    const options = {
        page: parseInt(query.page) || 1,
        pageSize: parseInt(query.pageSize) || 10,
        reservationPage: query.reservationPage ? JSON.parse(query.reservationPage) : 1,
        reservationPageSize: parseInt(query.reservationPageSize) || 10,
        sortBy: query.sortBy || 'name',
        sortDir: query.sortDir || 'asc',
        search: query.search || undefined
    };
    const startDate = (_a = filters.startDate) !== null && _a !== void 0 ? _a : null;
    const endDate = (_b = filters.endDate) !== null && _b !== void 0 ? _b : null;
    const periodConfig = (0, buildPeriodConfig_1.buildPeriodConfig)(startDate, endDate);
    return {
        ownerId,
        filters,
        options,
        period: { startDate, endDate },
        periodConfig
    };
}
