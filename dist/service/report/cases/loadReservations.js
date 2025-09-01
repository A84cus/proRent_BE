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
exports.loadReservations = loadReservations;
// service/report/cases/loadReservations.ts
const prisma_1 = __importDefault(require("../../../prisma"));
function loadReservations(ownerId, filters, reportStart, reportEnd) {
    return __awaiter(this, void 0, void 0, function* () {
        const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ Property: { OwnerId: ownerId } }, (filters.propertyId && { propertyId: filters.propertyId })), (filters.roomTypeId && { roomTypeId: filters.roomTypeId })), (reportStart && { startDate: { lte: reportEnd } })), (reportEnd && { endDate: { gte: reportStart } })), (filters.reservationStatus && { orderStatus: filters.reservationStatus })), (filters.invoiceNumber && { payment: { invoiceNumber: filters.invoiceNumber } }));
        const orConditions = [];
        if (filters.customerName) {
            orConditions.push({ User: { profile: { firstName: { contains: filters.customerName, mode: 'insensitive' } } } }, { User: { profile: { lastName: { contains: filters.customerName, mode: 'insensitive' } } } });
        }
        if (filters.email) {
            orConditions.push({ User: { email: { contains: filters.email, mode: 'insensitive' } } });
        }
        if (filters.search) {
            // Use search term for customer name or email if specific filters aren't provided
            if (!filters.customerName) {
                orConditions.push({ User: { profile: { firstName: { contains: filters.search, mode: 'insensitive' } } } }, { User: { profile: { lastName: { contains: filters.search, mode: 'insensitive' } } } });
            }
            if (!filters.email) {
                orConditions.push({ User: { email: { contains: filters.search, mode: 'insensitive' } } });
            }
            // Optionally, if you want search to also filter properties (requires join or separate query logic)
            // This is more complex and might not be intended for loadReservations.
        }
        if (orConditions.length > 0) {
            where.OR = orConditions;
        }
        return prisma_1.default.reservation.findMany({
            where,
            include: {
                User: { include: { profile: true } },
                Property: {
                    include: {
                        location: { include: { city: { include: { province: true } } } },
                        mainPicture: true,
                        roomTypes: true
                    }
                },
                RoomType: { select: { id: true, name: true } },
                payment: { select: { invoiceNumber: true, amount: true } }
            },
            orderBy: { startDate: 'asc' }
        });
    });
}
