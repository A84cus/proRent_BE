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
exports.findRoomTypePerformanceSummary = findRoomTypePerformanceSummary;
exports.upsertRoomTypePerformanceSummary = upsertRoomTypePerformanceSummary;
exports.deleteRoomTypePerformanceSummary = deleteRoomTypePerformanceSummary;
// src/services/report/roomTypePerformanceSummaryService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const buildSummaryData_1 = require("./utils/buildSummaryData");
// --- Service Functions ---
function findRoomTypePerformanceSummary(ownerId, roomTypeId, periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, verify the room type belongs to a property owned by the owner
        const roomTypeCheck = yield prisma_1.default.roomType.findUnique({
            where: {
                id: roomTypeId,
                property: {
                    OwnerId: ownerId // Check ownership via relation
                }
            },
            select: {
                id: true
            }
        });
        if (!roomTypeCheck) {
            // Room type doesn't exist or doesn't belong to an owner's property
            return null;
        }
        // If ownership is valid, find the summary record
        return yield prisma_1.default.roomTypePerformanceSummary.findUnique({
            where: {
                roomTypeId_periodType_periodKey: {
                    roomTypeId,
                    periodType,
                    periodKey
                }
            }
        });
    });
}
function upsertRoomTypePerformanceSummary(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomTypeId, propertyId: inputPropertyId, periodType, periodKey, year, month, incrementTotalRevenue, totalRevenue, incrementProjectedRevenue, projectedRevenue, incrementTotalReservations, totalReservations, incrementTotalNightsBooked, totalNightsBooked, incrementConfirmedCount, confirmedCount, incrementPendingPaymentCount, pendingPaymentCount, incrementPendingConfirmationCount, pendingConfirmationCount, incrementCancelledCount, cancelledCount, incrementUniqueUsers, uniqueUsers, OwnerId } = data;
        let finalPropertyId = inputPropertyId;
        if (!finalPropertyId) {
            const roomType = yield prisma_1.default.roomType.findUnique({
                where: { id: roomTypeId },
                select: { propertyId: true }
            });
            if (!roomType) {
                throw new Error(`RoomType with ID ${roomTypeId} not found.`);
            }
            finalPropertyId = roomType.propertyId;
        }
        // --- 🧱 Build update & create data ---
        const { update, create } = (0, buildSummaryData_1.buildSummaryUpdateData)({
            incrementTotalRevenue,
            totalRevenue,
            incrementProjectedRevenue,
            projectedRevenue,
            incrementTotalReservations,
            totalReservations,
            incrementTotalNightsBooked,
            totalNightsBooked,
            incrementConfirmedCount,
            confirmedCount,
            incrementPendingPaymentCount,
            pendingPaymentCount,
            incrementPendingConfirmationCount,
            pendingConfirmationCount,
            incrementCancelledCount,
            cancelledCount,
            incrementUniqueUsers,
            uniqueUsers
        });
        // --- 💾 Perform upsert ---
        return yield prisma_1.default.roomTypePerformanceSummary.upsert({
            where: {
                roomTypeId_periodType_periodKey: {
                    roomTypeId,
                    periodType,
                    periodKey
                }
            },
            update,
            create: Object.assign(Object.assign({}, create), { roomTypeId, propertyId: finalPropertyId, periodType,
                periodKey,
                year, month: month !== null && month !== void 0 ? month : null, OwnerId })
        });
    });
}
function deleteRoomTypePerformanceSummary(ownerId, roomTypeId, periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verify ownership before deletion
        const roomTypeCheck = yield prisma_1.default.roomType.findUnique({
            where: {
                id: roomTypeId,
                property: {
                    OwnerId: ownerId // Check ownership via relation
                }
            },
            select: {
                id: true
            }
        });
        if (!roomTypeCheck) {
            throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
        }
        return yield prisma_1.default.roomTypePerformanceSummary.delete({
            where: {
                roomTypeId_periodType_periodKey: {
                    roomTypeId,
                    periodType,
                    periodKey
                }
            }
        });
    });
}
