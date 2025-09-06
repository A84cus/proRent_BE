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
class PeakRateRepository {
    // Get room with ownership verification
    findRoomWithOwnership(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.room.findUnique({
                where: { id: roomId },
                include: {
                    property: {
                        select: {
                            id: true,
                            OwnerId: true,
                        },
                    },
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
                        },
                    },
                },
            });
        });
    }
    // Get room type with ownership verification
    findRoomTypeWithOwnership(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.roomType.findUnique({
                where: { id: roomTypeId },
                include: {
                    property: {
                        select: {
                            id: true,
                            OwnerId: true,
                        },
                    },
                },
            });
        });
    }
    // Get all peak rates for a room type
    findByRoomType(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.findMany({
                where: { roomTypeId },
                orderBy: { startDate: "asc" },
            });
        });
    }
    // Create peak rate
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.create({
                data: {
                    roomTypeId: data.roomTypeId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    rateType: data.rateType,
                    value: data.value,
                    description: data.description,
                },
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
                        },
                    },
                },
            });
        });
    }
    // Find peak rates that overlap with date range
    findOverlappingRates(roomTypeId, startDate, endDate, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.findMany({
                where: Object.assign({ roomTypeId, AND: [
                        {
                            OR: [
                                {
                                    AND: [
                                        { startDate: { lte: endDate } },
                                        { endDate: { gte: startDate } },
                                    ],
                                },
                            ],
                        },
                    ] }, (excludeId && { id: { not: excludeId } })),
            });
        });
    }
    // Find peak rate for specific date
    findByRoomTypeAndDate(roomTypeId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.findFirst({
                where: {
                    roomTypeId,
                    startDate: { lte: date },
                    endDate: { gte: date },
                },
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
                        },
                    },
                },
            });
        });
    }
    // Update peak rate
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.update({
                where: { id },
                data,
                include: {
                    roomType: {
                        select: {
                            id: true,
                            name: true,
                            basePrice: true,
                        },
                    },
                },
            });
        });
    }
    // Delete peak rate
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.delete({
                where: { id },
            });
        });
    }
    // Find peak rate by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.peakRate.findUnique({
                where: { id },
                include: {
                    roomType: {
                        include: {
                            property: {
                                select: {
                                    id: true,
                                    OwnerId: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
}
exports.default = new PeakRateRepository();
