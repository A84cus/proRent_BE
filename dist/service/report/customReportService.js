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
        var _a;
        const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
        const skip = (page - 1) * pageSize;
        // --- 🔐 Validate ownership ---
        if (filters.propertyId) {
            yield (0, cronjobValidationService_1.validatePropertyOwnership)(filters.ownerId, filters.propertyId);
        }
        else if (filters.roomTypeId) {
            yield (0, cronjobValidationService_1.validateRoomTypeOwnership)(filters.ownerId, filters.roomTypeId);
        }
        // --- 🔍 Base where clause ---
        const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ orderStatus: { not: 'CANCELLED' } }, (filters.startDate && { startDate: { lte: filters.endDate || new Date() } })), (filters.endDate && { endDate: { gte: filters.startDate || new Date('1970') } })), (filters.status && { orderStatus: { in: filters.status } })), (filters.propertyId && { propertyId: filters.propertyId })), (filters.roomTypeId && { roomTypeId: filters.roomTypeId }));
        // Add search filter
        if (filters.search) {
            where.OR = [
                { User: { email: { contains: filters.search, mode: 'insensitive' } } },
                { User: { name: { contains: filters.search, mode: 'insensitive' } } }
            ];
        }
        // If CANCELLED is explicitly requested
        if ((_a = filters.status) === null || _a === void 0 ? void 0 : _a.includes('CANCELLED')) {
            delete where.orderStatus;
            where.orderStatus = { in: filters.status };
        }
        // --- 🔢 Get total count ---
        const total = yield prisma_1.default.reservation.count({ where });
        // --- 📄 Get paginated data ---
        const data = yield prisma_1.default.reservation.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: getOrderBy(sortBy, sortDir),
            select: {
                id: true,
                userId: true,
                propertyId: true,
                roomTypeId: true,
                startDate: true,
                endDate: true,
                orderStatus: true,
                createdAt: true,
                payment: {
                    select: {
                        amount: true,
                        paidAt: true
                    }
                },
                User: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                Property: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                RoomType: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        const mappedData = data.map(r => {
            var _a, _b, _c, _d, _e;
            return ({
                id: r.id,
                userId: r.userId,
                propertyId: r.propertyId,
                roomTypeId: r.roomTypeId,
                startDate: r.startDate,
                endDate: r.endDate,
                orderStatus: r.orderStatus,
                paymentAmount: (_b = (_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
                paidAt: (_d = (_c = r.payment) === null || _c === void 0 ? void 0 : _c.paidAt) !== null && _d !== void 0 ? _d : null,
                createdAt: r.createdAt,
                user: {
                    id: r.User.id,
                    email: r.User.email,
                    profile: (_e = r.User.profile) !== null && _e !== void 0 ? _e : {
                        firstName: null,
                        lastName: null
                    }
                },
                property: r.Property,
                roomType: r.RoomType
            });
        });
        // --- 📊 Compute summary ---
        const summary = yield computeSummary(filters);
        // --- 📦 Return response ---
        return {
            data: mappedData,
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
// --- Helper: Sort order ---
function getOrderBy(sortBy, sortDir) {
    switch (sortBy) {
        case 'paymentAmount':
            return { payment: { amount: sortDir } };
        case 'createdAt':
            return { createdAt: sortDir };
        case 'endDate':
            return { endDate: sortDir };
        default:
            return { startDate: sortDir };
    }
}
// --- Helper: Compute summary counts and revenue ---
function computeSummary(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseWhere = Object.assign(Object.assign(Object.assign(Object.assign({}, (filters.startDate && { startDate: { lte: filters.endDate || new Date() } })), (filters.endDate && { endDate: { gte: filters.startDate || new Date('1970') } })), (filters.propertyId && { propertyId: filters.propertyId })), (filters.roomTypeId && { roomTypeId: filters.roomTypeId }));
        // Get counts and revenue by status
        const [pendingPayment, pendingConfirmation, confirmed, cancelled] = yield Promise.all([
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'PENDING_PAYMENT', payment: { paymentStatus: 'CONFIRMED' } // Only CONFIRMED ones contribute to revenue
                 }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'PENDING_CONFIRMATION', payment: { paymentStatus: 'CONFIRMED' } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'CONFIRMED', payment: { paymentStatus: 'CONFIRMED' } }),
                select: { payment: { select: { amount: true } } }
            }),
            prisma_1.default.reservation.count({
                where: Object.assign(Object.assign({}, baseWhere), { orderStatus: 'CANCELLED' })
            })
        ]);
        const sumRevenue = (reservations) => reservations.reduce((sum, r) => { var _a; return sum + (((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        const avgRevenue = (reservations) => reservations.reduce((sum, r) => { var _a; return sum + (((_a = r.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0) / reservations.length;
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
                average: avgRevenue(confirmed)
            },
            totalReservations: pendingPayment.length + pendingConfirmation.length + confirmed.length + cancelled
        };
    });
}
