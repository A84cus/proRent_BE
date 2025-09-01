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
const prisma_1 = __importDefault(require("../../prisma"));
class AvailabilityRepository {
    // Get availability for a specific room for a month
    findRoomAvailabilityByMonth(roomId, year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
            const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month
            return prisma_1.default.availability.findMany({
                where: {
                    roomId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            propertyId: true
                        }
                    },
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true
                        }
                    }
                },
                orderBy: { date: 'asc' }
            });
        });
    }
    // Get room with ownership verification
    findRoomWithOwnership(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.room.findUnique({
                where: { id: roomId },
                include: {
                    property: {
                        select: {
                            id: true,
                            OwnerId: true
                        }
                    },
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true
                        }
                    }
                }
            });
        });
    }
    // Bulk upsert availability for specific room
    bulkUpsertRoomAvailability(roomId, roomTypeId, availabilityData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                for (const data of availabilityData) {
                    yield tx.availability.upsert({
                        where: {
                            roomId_date: {
                                roomId,
                                date: data.date
                            }
                        },
                        update: {
                            availableCount: data.isAvailable ? 1 : 0
                        },
                        create: {
                            date: data.date,
                            availableCount: data.isAvailable ? 1 : 0,
                            roomTypeId,
                            roomId
                        }
                    });
                }
            }));
        });
    }
    // Get availability conflicts (existing reservations)
    getReservationConflicts(roomId, dates) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.reservation.findMany({
                where: {
                    roomId,
                    orderStatus: {
                        in: ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED']
                    },
                    deletedAt: null,
                    OR: dates.map(date => ({
                        AND: [{ startDate: { lte: date } }, { endDate: { gte: date } }]
                    }))
                },
                select: {
                    id: true,
                    startDate: true,
                    endDate: true,
                    orderStatus: true
                }
            });
        });
    }
    // Generate date range for a month
    generateMonthDates(year, month) {
        const dates = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(new Date(year, month - 1, day));
        }
        return dates;
    }
    // Get existing availability for dates to check what's missing
    getExistingAvailability(roomId, dates) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.availability.findMany({
                where: {
                    roomId,
                    date: {
                        in: dates
                    }
                }
            });
        });
    }
    // Get peak rates for a room type in a date range
    getPeakRates(roomTypeId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.findMany({
                where: {
                    roomTypeId,
                    OR: [
                        {
                            AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }]
                        }
                    ]
                },
                orderBy: { startDate: 'asc' }
            });
        });
    }
    // Bulk upsert availability for a room type
    bulkUpsertRoomTypeAvailability(roomTypeId, availabilityData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                for (const { date, isAvailable } of availabilityData) {
                    yield tx.availability.upsert({
                        where: {
                            roomTypeId_date: {
                                roomTypeId,
                                date
                            }
                        },
                        update: {
                            availableCount: isAvailable ? 1 : 0 // Simplified: 1 if available, 0 if not
                        },
                        create: {
                            roomTypeId,
                            date,
                            availableCount: isAvailable ? 1 : 0
                        }
                    });
                }
            }));
        });
    }
    // Find room type availability by month
    findRoomTypeAvailabilityByMonth(roomTypeId, year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
            const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month
            return prisma_1.default.availability.findMany({
                where: {
                    roomTypeId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true
                        }
                    }
                },
                orderBy: { date: 'asc' }
            });
        });
    }
}
exports.default = new AvailabilityRepository();
