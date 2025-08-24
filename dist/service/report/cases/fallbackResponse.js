"use strict";
// src/services/report/dashboard/fallback.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackResponse = fallbackResponse;
function fallbackResponse() {
    return {
        properties: [],
        summary: {
            counts: { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
            revenue: { actual: 0, projected: 0, average: 0 }
        },
        period: { startDate: null, endDate: null },
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 }
    };
}
