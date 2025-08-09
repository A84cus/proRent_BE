"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
exports.addTotalAmounts = addTotalAmounts;
exports.validateQueryOptions = validateQueryOptions;
// services/reservationHelpers.ts
function calculatePagination(page, limit, totalCount) {
    return {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
    };
}
function addTotalAmounts(reservations) {
    return reservations.map(reservation => (Object.assign(Object.assign({}, reservation), { totalAmount: reservation.payments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) })));
}
function validateQueryOptions(options) {
    const { page = 1, limit = 10 } = options;
    if (page < 1) {
        throw new Error('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
    }
    return { page, limit };
}
