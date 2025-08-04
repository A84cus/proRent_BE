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
exports.decrementAvailability = decrementAvailability;
exports.incrementAvailability = incrementAvailability;
// services/availabilityService.ts
const prisma_1 = __importDefault(require("../../prisma"));
function checkAvailability(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        if (startDate >= endDate) {
            throw new Error('End date must be after start date');
        }
        const availabilityRecords = yield prisma_1.default.availability.findMany({
            where: {
                roomTypeId,
                date: { lte: endDate, gte: startDate }
            },
            select: {
                date: true,
                availableCount: true
            }
        });
        const numberOfStays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (availabilityRecords.length < numberOfStays) {
            console.warn(`Availability records for ${numberOfStays} days not found for room type ${roomTypeId}`);
            return false;
        }
        for (const record of availabilityRecords) {
            if (record.availableCount < 1) {
                return false;
            }
        }
        return true;
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
                        date: currentDate
                    }
                },
                update: {},
                create: {
                    roomTypeId,
                    date: currentDate,
                    availableCount: totalQuantity
                }
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
}
function decrementAvailability(tx, roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentDate = new Date(startDate);
        const endDateExclusive = new Date(endDate);
        while (currentDate < endDateExclusive) {
            yield tx.availability.update({
                where: {
                    roomTypeId_date: {
                        roomTypeId,
                        date: new Date(currentDate)
                    }
                },
                data: {
                    availableCount: {
                        decrement: 1
                    }
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
