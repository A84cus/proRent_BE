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
exports.getTransactionReport = getTransactionReport;
exports.getUserReservationReport = getUserReservationReport;
exports.checkProperty = checkProperty;
// services/report/reportFetchService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const reportQueryService_1 = require("./reportQueryService");
const library_1 = require("@prisma/client/runtime/library");
// --- Transaction Report ---
function getTransactionReport(ownerId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { startDate, endDate, orderStatus = [client_1.Status.CONFIRMED] } = filters;
        // Define date filter for reservations (on createdAt)
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = startDate;
        }
        if (endDate) {
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            dateFilter.lte = adjustedEndDate;
        }
        // --- Fetch Raw Data ---
        const reservations = yield prisma_1.default.reservation.findMany({
            where: {
                Property: {
                    OwnerId: ownerId
                },
                orderStatus: {
                    in: orderStatus
                },
                createdAt: dateFilter
            },
            select: reportQueryService_1.TransactionReportQuery,
            orderBy: {
                createdAt: 'desc'
            }
        });
        // --- Map to Report Items ---
        const transactionReportItems = reservations.map(res => {
            var _a, _b, _c, _d, _e;
            return ({
                reservationId: res.id,
                propertyName: ((_a = res.Property) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Property',
                roomTypeName: ((_b = res.RoomType) === null || _b === void 0 ? void 0 : _b.name) || undefined, // Will be undefined for whole property types if not linked
                userId: res.userId,
                userEmail: ((_c = res.User) === null || _c === void 0 ? void 0 : _c.email) || 'Unknown User',
                userFullName: ((_d = res.User) === null || _d === void 0 ? void 0 : _d.profile)
                    ? `${res.User.profile.firstName || ''} ${res.User.profile.lastName || ''}`.trim() || undefined
                    : undefined,
                startDate: res.startDate,
                endDate: res.endDate,
                orderStatus: res.orderStatus,
                totalAmount: ((_e = res.payment) === null || _e === void 0 ? void 0 : _e.amount) || 0,
                createdAt: res.createdAt
            });
        });
        return transactionReportItems;
    });
}
function getUserReservationReport(ownerId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { startDate, endDate, orderStatuses = [client_1.Status.CONFIRMED] } = filters;
        // Define date filter for reservations (on createdAt)
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = startDate;
        }
        if (endDate) {
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            dateFilter.lte = adjustedEndDate;
        }
        // --- Fetch Raw Data ---
        const reservations = yield prisma_1.default.reservation.findMany({
            where: {
                Property: {
                    OwnerId: ownerId
                },
                orderStatus: {
                    in: orderStatuses
                },
                createdAt: dateFilter
            },
            select: reportQueryService_1.TransactionUserReportQuery
        });
        // --- Aggregate Data in Memory ---
        // Group data by user
        const userMap = {};
        for (const reservation of reservations) {
            const userId = reservation.userId;
            const amount = new library_1.Decimal((_b = (_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : 0);
            const userData = reservation.User; // Contains email and profile
            if (!userMap[userId]) {
                userMap[userId] = {
                    totalReservations: 0,
                    totalAmount: new library_1.Decimal(0),
                    userData
                };
            }
            userMap[userId].totalReservations += 1;
            userMap[userId].totalAmount = userMap[userId].totalAmount.plus(amount);
            // userData is assumed to be the same for a given userId, so no need to update it in the loop
        }
        // --- Build Report Items ---
        const userReportItems = Object.entries(userMap).map(([userId, data]) => {
            var _a;
            return ({
                userId,
                userEmail: ((_a = data.userData) === null || _a === void 0 ? void 0 : _a.email) || 'Unknown User',
                userFullName: data.userData
                    ? `${data.userData.firstName || ''} ${data.userData.lastName || ''}`.trim() || undefined
                    : undefined,
                totalReservations: data.totalReservations,
                totalAmount: data.totalAmount
            });
        });
        // Sort by total reservations descending, then by total amount descending
        userReportItems.sort((a, b) => {
            if (b.totalReservations !== a.totalReservations) {
                return b.totalReservations - a.totalReservations;
            }
            return b.totalAmount.minus(a.totalAmount).toNumber();
        });
        return userReportItems;
    });
}
function checkProperty(id, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const propertyId = id;
            const propertyCheck = yield prisma_1.default.property.findUnique({
                where: {
                    id: propertyId,
                    OwnerId: ownerId // This ensures the property belongs to the owner
                },
                select: {
                    id: true // Just need to confirm existence/access
                }
            });
            if (!propertyCheck) {
                throw new Error(`Property with ID ${propertyId} not found or access denied.`);
            }
        }
        catch (error) {
            throw error;
        }
    });
}
