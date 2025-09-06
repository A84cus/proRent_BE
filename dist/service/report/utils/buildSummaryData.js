"use strict";
// src/services/report/utils/buildSummaryUpdateData.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFieldUpdate = buildFieldUpdate;
exports.buildSummaryUpdateData = buildSummaryUpdateData;
/**
 * Builds a single field update object: either { increment: value } or absolute value
 * Used in upsert operations for summary tables.
 */
function buildFieldUpdate({ incrementField, absoluteField, createDefault }) {
    if (incrementField !== undefined) {
        return {
            update: { increment: incrementField },
            create: createDefault + incrementField // Works for number, Decimal
        };
    }
    else if (absoluteField !== undefined) {
        return {
            update: absoluteField,
            create: absoluteField
        };
    }
    else {
        return {
            update: createDefault,
            create: createDefault
        };
    }
}
/**
 * Builds the full update and create objects for performance summary upsert
 */
function buildSummaryUpdateData({ 
// Revenue
incrementTotalRevenue, totalRevenue, incrementProjectedRevenue, projectedRevenue, 
// Reservations
incrementTotalReservations, totalReservations, incrementTotalNightsBooked, totalNightsBooked, 
// Status counts
incrementConfirmedCount, confirmedCount, incrementPendingPaymentCount, pendingPaymentCount, incrementPendingConfirmationCount, pendingConfirmationCount, incrementCancelledCount, cancelledCount, 
// Users
incrementUniqueUsers, uniqueUsers }) {
    const totalRevenueUpdate = buildFieldUpdate({
        incrementField: incrementTotalRevenue,
        absoluteField: totalRevenue,
        createDefault: 0
    });
    const projectedRevenueUpdate = buildFieldUpdate({
        incrementField: incrementProjectedRevenue,
        absoluteField: projectedRevenue,
        createDefault: 0
    });
    const totalReservationsUpdate = buildFieldUpdate({
        incrementField: incrementTotalReservations,
        absoluteField: totalReservations,
        createDefault: 0
    });
    const totalNightsBookedUpdate = buildFieldUpdate({
        incrementField: incrementTotalNightsBooked,
        absoluteField: totalNightsBooked,
        createDefault: 0
    });
    const confirmedCountUpdate = buildFieldUpdate({
        incrementField: incrementConfirmedCount,
        absoluteField: confirmedCount,
        createDefault: 0
    });
    const pendingPaymentCountUpdate = buildFieldUpdate({
        incrementField: incrementPendingPaymentCount,
        absoluteField: pendingPaymentCount,
        createDefault: 0
    });
    const pendingConfirmationCountUpdate = buildFieldUpdate({
        incrementField: incrementPendingConfirmationCount,
        absoluteField: pendingConfirmationCount,
        createDefault: 0
    });
    const cancelledCountUpdate = buildFieldUpdate({
        incrementField: incrementCancelledCount,
        absoluteField: cancelledCount,
        createDefault: 0
    });
    const uniqueUsersUpdate = buildFieldUpdate({
        incrementField: incrementUniqueUsers,
        absoluteField: uniqueUsers,
        createDefault: 0
    });
    return {
        update: {
            totalRevenue: totalRevenueUpdate.update,
            projectedRevenue: projectedRevenueUpdate.update,
            totalReservations: totalReservationsUpdate.update,
            totalNightsBooked: totalNightsBookedUpdate.update,
            confirmedCount: confirmedCountUpdate.update,
            pendingPaymentCount: pendingPaymentCountUpdate.update,
            pendingConfirmationCount: pendingConfirmationCountUpdate.update,
            cancelledCount: cancelledCountUpdate.update,
            uniqueUsers: uniqueUsersUpdate.update,
            lastUpdated: new Date()
        },
        create: {
            totalRevenue: totalRevenueUpdate.create,
            projectedRevenue: projectedRevenueUpdate.create,
            totalReservations: totalReservationsUpdate.create,
            totalNightsBooked: totalNightsBookedUpdate.create,
            confirmedCount: confirmedCountUpdate.create,
            pendingPaymentCount: pendingPaymentCountUpdate.create,
            pendingConfirmationCount: pendingConfirmationCountUpdate.create,
            cancelledCount: cancelledCountUpdate.create,
            uniqueUsers: uniqueUsersUpdate.create
        }
    };
}
