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
exports.checkAvailability = checkAvailability;
exports.validateAvailabilityRecords = validateAvailabilityRecords;
exports.DecrementAvailability = DecrementAvailability;
exports.incrementAvailability = incrementAvailability;
// services/availabilityService.ts
const prisma_1 = __importDefault(require("../../prisma"));
function getRoomTypeTotalQuantity(roomTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomType = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
            select: { totalQuantity: true }
        });
        if (!roomType) {
            throw new Error(`RoomType with id ${roomTypeId} not found.`);
        }
        return roomType.totalQuantity;
    });
}
function generateDateRange(startDate, endDate) {
    if (startDate >= endDate) {
        throw new Error('End date must be after start date');
    }
    const dates = [];
    const current = new Date(startDate);
    const endExclusive = new Date(endDate);
    while (current < endExclusive) {
        dates.push(new Date(current)); // Push a copy
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
function getAvailabilityRecords(roomTypeId, datesToCheck) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.availability.findMany({
            where: {
                roomTypeId,
                date: { in: datesToCheck }
            },
            select: {
                date: true,
                availableCount: true
            }
        });
    });
}
function buildAvailabilityMap(availabilityRecords) {
    const map = new Map();
    availabilityRecords.forEach(record => {
        // Consider using date formatting utilities for consistency
        map.set(record.date.toISOString().split('T')[0], record.availableCount);
    });
    return map;
}
function isDateAvailable(date, availabilityMap, totalQuantity) {
    const dateKey = date.toISOString().split('T')[0];
    const availableCount = availabilityMap.has(dateKey) ? availabilityMap.get(dateKey) : totalQuantity;
    return availableCount >= 1;
}
// --- Main Exported Functions ---
function checkAvailability(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const totalQuantity = yield getRoomTypeTotalQuantity(roomTypeId);
        const datesToCheck = generateDateRange(startDate, endDate);
        const availabilityRecords = yield getAvailabilityRecords(roomTypeId, datesToCheck);
        const availabilityMap = buildAvailabilityMap(availabilityRecords);
        for (const date of datesToCheck) {
            if (!isDateAvailable(date, availabilityMap, totalQuantity)) {
                return false; // Fail fast if any date is unavailable
            }
        }
        return true; // All dates are available
    });
}
function validateAvailabilityRecords(roomTypeId, startDate, endDate, totalQuantity) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentDate = new Date(startDate);
        const endDateExclusive = new Date(endDate);
        while (currentDate < endDateExclusive) {
            yield prisma_1.default.availability.upsert({
                where: {
                    roomTypeId_date: {
                        roomTypeId,
                        date: new Date(currentDate)
                    }
                },
                update: {},
                create: {
                    roomTypeId,
                    date: new Date(currentDate),
                    availableCount: totalQuantity
                }
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
}
// Modified decrement function that ensures record existence
function DecrementAvailability(tx, roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const totalQuantity = yield getRoomTypeTotalQuantity(roomTypeId);
        const currentDate = new Date(startDate);
        const endDateExclusive = new Date(endDate);
        while (currentDate < endDateExclusive) {
            const dateForQuery = new Date(currentDate);
            yield tx.availability.upsert({
                where: {
                    roomTypeId_date: {
                        roomTypeId,
                        date: dateForQuery
                    }
                },
                update: {
                    availableCount: {
                        decrement: 1
                    }
                },
                create: {
                    roomTypeId,
                    date: dateForQuery,
                    availableCount: totalQuantity - 1
                }
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
}
function incrementAvailability(tx, roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentDate = new Date(startDate);
        const endDateExclusive = new Date(endDate);
        while (currentDate < endDateExclusive) {
            yield tx.availability.update({
                where: {
                    roomTypeId_date: {
                        roomTypeId,
                        date: currentDate
                    }
                },
                data: {
                    availableCount: {
                        increment: 1
                    }
                }
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
}
