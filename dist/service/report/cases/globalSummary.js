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
exports.loadGlobalSummary = loadGlobalSummary;
// src/services/report/cases/globalSummary.ts (Leaner Query)
const prisma_1 = __importDefault(require("../../../prisma"));
const NOW = new Date();
function loadGlobalSummary(ownerId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const where = Object.assign(Object.assign({ Property: { OwnerId: ownerId } }, (startDate && { startDate: { lte: endDate } })), (endDate && { endDate: { gte: startDate } }));
        // Fetch only essential fields and payment amount
        const reservations = yield prisma_1.default.reservation.findMany({
            where,
            select: {
                // Use 'select' instead of 'include'
                id: true, // Needed for Set size calculation if kept
                propertyId: true, // Needed for Set size calculation
                orderStatus: true,
                startDate: true,
                payment: {
                    select: {
                        amount: true
                    }
                }
            }
        });
        // Reduce logic remains largely the same, just working with selected fields
        const summary = reservations.reduce((acc, r) => {
            var _a;
            const amount = ((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0;
            if (r.orderStatus === 'CONFIRMED') {
                acc.totalActualRevenue += amount;
            }
            if (['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED'].includes(r.orderStatus) && amount > 0) {
                acc.totalProjectedRevenue += amount;
            }
            if (['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED'].includes(r.orderStatus) &&
                new Date(r.startDate) >= NOW) {
                acc.totalActiveBookings++;
            }
            return acc;
        }, {
            totalProperties: 0,
            totalActiveBookings: 0,
            totalActualRevenue: 0,
            totalProjectedRevenue: 0
        });
        // Calculate unique properties using the fetched data
        summary.totalProperties = new Set(reservations.map(r => r.propertyId)).size;
        return summary;
    });
}
