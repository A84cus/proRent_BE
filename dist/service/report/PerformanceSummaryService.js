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
exports.findPropertyPerformanceSummary = findPropertyPerformanceSummary;
exports.upsertPropertyPerformanceSummary = upsertPropertyPerformanceSummary;
exports.deletePropertyPerformanceSummary = deletePropertyPerformanceSummary;
// src/services/report/propertyPerformanceSummaryService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const library_1 = require("@prisma/client/runtime/library");
// --- Service Functions ---
function findPropertyPerformanceSummary(ownerId, propertyId, periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, verify the property belongs to the owner
        const propertyCheck = yield prisma_1.default.property.findUnique({
            where: {
                id: propertyId,
                OwnerId: ownerId
            },
            select: {
                id: true
            }
        });
        if (!propertyCheck) {
            // Property doesn't exist or doesn't belong to the owner
            return null;
        }
        // If ownership is valid, find the summary record
        return yield prisma_1.default.propertyPerformanceSummary.findUnique({
            where: {
                propertyId_periodType_periodKey: {
                    propertyId,
                    periodType,
                    periodKey
                }
            }
        });
    });
}
function upsertPropertyPerformanceSummary(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { propertyId, periodType, periodKey, year, month, incrementTotalRevenue, totalRevenue, incrementProjectedRevenue, projectedRevenue, incrementTotalReservations, totalReservations, incrementConfirmedCount, confirmedCount, incrementPendingPaymentCount, pendingPaymentCount, incrementPendingConfirmationCount, pendingConfirmationCount, incrementCancelledCount, cancelledCount, incrementUniqueUsers, uniqueUsers, OwnerId } = data;
        const updateData = {};
        if (incrementTotalRevenue !== undefined) {
            updateData.totalRevenue = { increment: new library_1.Decimal(incrementTotalRevenue) };
        }
        else if (totalRevenue !== undefined) {
            updateData.totalRevenue = new library_1.Decimal(totalRevenue);
        }
        if (incrementProjectedRevenue !== undefined) {
            updateData.projectedRevenue = { increment: new library_1.Decimal(incrementProjectedRevenue) };
        }
        else if (projectedRevenue !== undefined) {
            updateData.projectedRevenue = new library_1.Decimal(projectedRevenue);
        }
        if (incrementTotalReservations !== undefined) {
            updateData.totalReservations = { increment: incrementTotalReservations };
        }
        else if (totalReservations !== undefined) {
            updateData.totalReservations = totalReservations;
        }
        if (incrementConfirmedCount !== undefined) {
            updateData.confirmedCount = { increment: incrementConfirmedCount };
        }
        else if (confirmedCount !== undefined) {
            updateData.confirmedCount = confirmedCount;
        }
        if (incrementPendingPaymentCount !== undefined) {
            updateData.pendingPaymentCount = { increment: incrementPendingPaymentCount };
        }
        else if (pendingPaymentCount !== undefined) {
            updateData.pendingPaymentCount = pendingPaymentCount;
        }
        if (incrementPendingConfirmationCount !== undefined) {
            updateData.pendingConfirmationCount = { increment: incrementPendingConfirmationCount };
        }
        else if (pendingConfirmationCount !== undefined) {
            updateData.pendingConfirmationCount = pendingConfirmationCount;
        }
        if (incrementCancelledCount !== undefined) {
            updateData.cancelledCount = { increment: incrementCancelledCount };
        }
        else if (cancelledCount !== undefined) {
            updateData.cancelledCount = cancelledCount;
        }
        if (incrementUniqueUsers !== undefined) {
            updateData.uniqueUsers = { increment: incrementUniqueUsers };
        }
        else if (uniqueUsers !== undefined) {
            updateData.uniqueUsers = uniqueUsers;
        }
        updateData.lastUpdated = new Date();
        return yield prisma_1.default.propertyPerformanceSummary.upsert({
            where: {
                propertyId_periodType_periodKey: {
                    propertyId,
                    periodType,
                    periodKey
                }
            },
            update: updateData,
            create: {
                propertyId,
                periodType,
                periodKey,
                year,
                month: month !== null && month !== void 0 ? month : null,
                totalRevenue: new library_1.Decimal((_a = totalRevenue !== null && totalRevenue !== void 0 ? totalRevenue : incrementTotalRevenue) !== null && _a !== void 0 ? _a : 0),
                projectedRevenue: new library_1.Decimal((_b = projectedRevenue !== null && projectedRevenue !== void 0 ? projectedRevenue : incrementProjectedRevenue) !== null && _b !== void 0 ? _b : 0),
                totalReservations: (_c = totalReservations !== null && totalReservations !== void 0 ? totalReservations : incrementTotalReservations) !== null && _c !== void 0 ? _c : 0,
                confirmedCount: (_d = confirmedCount !== null && confirmedCount !== void 0 ? confirmedCount : incrementConfirmedCount) !== null && _d !== void 0 ? _d : 0,
                pendingPaymentCount: (_e = pendingPaymentCount !== null && pendingPaymentCount !== void 0 ? pendingPaymentCount : incrementPendingPaymentCount) !== null && _e !== void 0 ? _e : 0,
                pendingConfirmationCount: (_f = pendingConfirmationCount !== null && pendingConfirmationCount !== void 0 ? pendingConfirmationCount : incrementPendingConfirmationCount) !== null && _f !== void 0 ? _f : 0,
                cancelledCount: (_g = cancelledCount !== null && cancelledCount !== void 0 ? cancelledCount : incrementCancelledCount) !== null && _g !== void 0 ? _g : 0,
                uniqueUsers: (_h = uniqueUsers !== null && uniqueUsers !== void 0 ? uniqueUsers : incrementUniqueUsers) !== null && _h !== void 0 ? _h : 0,
                OwnerId
            }
        });
    });
}
function deletePropertyPerformanceSummary(ownerId, propertyId, periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verify ownership before deletion
        const propertyCheck = yield prisma_1.default.property.findUnique({
            where: {
                id: propertyId,
                OwnerId: ownerId
            },
            select: {
                id: true
            }
        });
        if (!propertyCheck) {
            throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
        }
        return yield prisma_1.default.propertyPerformanceSummary.delete({
            where: {
                propertyId_periodType_periodKey: {
                    propertyId,
                    periodType,
                    periodKey
                }
            }
        });
    });
}
