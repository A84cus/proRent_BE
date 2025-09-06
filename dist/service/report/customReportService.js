"use strict";
// src/services/report/reservationReportService.ts
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
exports.getReservationReport = getReservationReport;
const prisma_1 = __importDefault(require("../../prisma"));
const cronjobValidationService_1 = require("./cronJob/cronjobValidationService");
// --- Main Function ---
function getReservationReport(filters_1) {
    return __awaiter(this, arguments, void 0, function* (filters, options = {}) {
        const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
        const skip = (page - 1) * pageSize;
        // 🔐 Ownership validation
        if (filters.propertyId) {
            yield (0, cronjobValidationService_1.validatePropertyOwnership)(filters.ownerId, filters.propertyId);
        }
        if (filters.roomTypeId && filters.propertyId) {
            yield (0, cronjobValidationService_1.validateRoomTypeOwnership)(filters.ownerId, filters.roomTypeId);
        }
        // 🔹 Build WHERE clause
        const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (filters.propertyId && { propertyId: filters.propertyId })), (filters.roomTypeId && { roomTypeId: filters.roomTypeId })), (filters.startDate && { startDate: { lte: filters.endDate || new Date() } })), (filters.endDate && { endDate: { gte: filters.startDate || new Date('1970-01-01') } })), (filters.reservationStatus && { orderStatus: filters.reservationStatus }));
        // 🔍 Text search
        if (filters.customerName || filters.email || filters.invoiceNumber) {
            where.OR = [];
            if (filters.customerName) {
                where.OR.push({ User: { profile: { firstName: { contains: filters.customerName, mode: 'insensitive' } } } }, { User: { profile: { lastName: { contains: filters.customerName, mode: 'insensitive' } } } });
            }
            if (filters.email) {
                where.OR.push({
                    User: { email: { contains: filters.email, mode: 'insensitive' } }
                });
            }
            if (filters.invoiceNumber) {
                where.OR.push({
                    payment: { invoiceNumber: { equals: filters.invoiceNumber, mode: 'insensitive' } }
                });
            }
        }
        // 🔢 Count total
        const total = yield prisma_1.default.reservation.count({ where });
        // 📥 Fetch data
        const reservations = yield prisma_1.default.reservation.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: getOrderBy(sortBy, sortDir),
            include: {
                User: {
                    include: {
                        profile: true
                    }
                },
                payment: {
                    select: {
                        invoiceNumber: true,
                        amount: true
                    }
                }
            }
        });
        // 🔄 Map to ReservationListItem
        const data = reservations.map(r => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: r.id,
                userId: r.userId,
                roomId: r.roomId,
                startDate: r.startDate,
                endDate: r.endDate,
                orderStatus: r.orderStatus,
                paymentAmount: (_b = (_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : 0, // number, not null
                invoiceNumber: (_d = (_c = r.payment) === null || _c === void 0 ? void 0 : _c.invoiceNumber) !== null && _d !== void 0 ? _d : null,
                user: {
                    email: r.User.email,
                    firstName: ((_e = r.User.profile) === null || _e === void 0 ? void 0 : _e.firstName) || null,
                    lastName: ((_f = r.User.profile) === null || _f === void 0 ? void 0 : _f.lastName) || null
                }
            });
        });
        // 📊 Compute summary
        const summary = yield computeSummary(filters);
        return {
            data,
            summary,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    });
}
// --- Sorting Logic ---
function getOrderBy(sortBy, sortDir) {
    switch (sortBy) {
        case 'paymentAmount':
            return { payment: { amount: sortDir } };
        case 'createdAt':
            return { createdAt: sortDir };
        case 'startDate':
            return { startDate: sortDir };
        case 'endDate':
            return { endDate: sortDir };
        case 'invoiceNumber':
            return { payment: { invoiceNumber: sortDir } };
        default:
            return { startDate: sortDir };
    }
}
// --- Summary Calculation ---
function computeSummary(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseWhere = Object.assign(Object.assign(Object.assign(Object.assign({}, (filters.propertyId && { propertyId: filters.propertyId })), (filters.roomTypeId && { roomTypeId: filters.roomTypeId })), (filters.startDate && { startDate: { lte: filters.endDate || new Date() } })), (filters.endDate && { endDate: { gte: filters.startDate || new Date('1970-01-01') } }));
        const [draft, pendingPayment, pendingConfirmation, confirmed, cancelled] = yield Promise.all([
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'DRAFT', payment: { amount: { gt: 0 } } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'PENDING_PAYMENT', payment: { amount: { gt: 0 } } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'PENDING_CONFIRMATION', payment: { amount: { gt: 0 } } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'CONFIRMED', payment: { amount: { gt: 0 } } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.count({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'CANCELLED' })
            })
        ]);
        const sumRevenue = (reservations) => reservations.reduce((sum, r) => { var _a; return sum + (((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        const actualRevenue = sumRevenue(confirmed);
        const projectedRevenue = sumRevenue(pendingPayment) + sumRevenue(pendingConfirmation) + actualRevenue;
        return {
            counts: {
                PENDING_PAYMENT: pendingPayment.length,
                PENDING_CONFIRMATION: pendingConfirmation.length,
                CONFIRMED: confirmed.length,
                CANCELLED: cancelled
            },
            revenue: {
                actual: actualRevenue,
                projected: projectedRevenue,
                average: confirmed.length > 0 ? actualRevenue / confirmed.length : 0
            },
            totalReservations: pendingPayment.length + pendingConfirmation.length + confirmed.length + cancelled
        };
    });
}
