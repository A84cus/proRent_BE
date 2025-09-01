"use strict";
// src/services/report/dashboard/utils/getDailySummary.ts
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
exports.getDailySummary = getDailySummary;
const prisma_1 = __importDefault(require("../../../prisma"));
function getDailySummary(ownerId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));
        const reservations = yield prisma_1.default.reservation.findMany({
            where: {
                Property: { OwnerId: ownerId },
                startDate: { lt: end },
                endDate: { gte: start }
            },
            select: {
                orderStatus: true,
                payment: { select: { amount: true } }
            }
        });
        let actualRevenue = 0;
        let projectedRevenue = 0;
        let confirmed = 0;
        let pending = 0;
        for (const r of reservations) {
            const amount = ((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0;
            if (r.orderStatus === 'CONFIRMED') {
                actualRevenue += amount;
                confirmed++;
            }
            else if (['PENDING_PAYMENT', 'PENDING_CONFIRMATION'].includes(r.orderStatus)) {
                projectedRevenue += amount;
                pending++;
            }
        }
        return {
            date: start.toISOString().split('T')[0],
            actualRevenue,
            projectedRevenue,
            confirmed,
            pending
        };
    });
}
