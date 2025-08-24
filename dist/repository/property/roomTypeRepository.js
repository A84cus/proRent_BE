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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoomTypeRepository {
    // Get all room types by property ID
    findAllByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.findMany({
                where: { propertyId },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            OwnerId: true,
                        },
                    },
                    rooms: {
                        include: {
                            gallery: {
                                include: {
                                    picture: true,
                                },
                            },
                        },
                    },
                    availabilities: true,
                    peakRates: true,
                    _count: {
                        select: {
                            rooms: true,
                            reservations: true,
                            availabilities: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    // Find room type by ID with full details
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.findUnique({
                where: { id },
                include: {
                    property: {
                        include: {
                            Owner: {
                                select: {
                                    id: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    rooms: {
                        include: {
                            gallery: {
                                include: {
                                    picture: true,
                                },
                            },
                            reservations: {
                                where: {
                                    orderStatus: {
                                        in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                                    },
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                    availabilities: true,
                    peakRates: true,
                    reservations: {
                        where: {
                            orderStatus: {
                                in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                            },
                            deletedAt: null,
                        },
                    },
                    _count: {
                        select: {
                            rooms: true,
                            reservations: true,
                            availabilities: true,
                        },
                    },
                },
            });
        });
    }
    // Find room type by ID and check property ownership
    findByIdAndOwner(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.findFirst({
                where: {
                    id,
                    property: {
                        OwnerId: ownerId,
                    },
                },
                include: {
                    property: true,
                    rooms: {
                        include: {
                            gallery: {
                                include: {
                                    picture: true,
                                },
                            },
                        },
                    },
                    availabilities: true,
                    peakRates: true,
                    _count: {
                        select: {
                            rooms: true,
                        },
                    },
                },
            });
        });
    }
    // Find room type by name and property
    findByNameAndProperty(name, propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.findFirst({
                where: {
                    name,
                    propertyId,
                },
            });
        });
    }
    // Create room type
    create(roomTypeData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.create({
                data: roomTypeData,
                include: {
                    property: true,
                    rooms: true,
                    _count: {
                        select: {
                            rooms: true,
                        },
                    },
                },
            });
        });
    }
    // Update room type
    update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.roomType.update({
                where: { id },
                data: updateData,
                include: {
                    property: true,
                    rooms: {
                        include: {
                            gallery: {
                                include: {
                                    picture: true,
                                },
                            },
                        },
                    },
                    availabilities: true,
                    peakRates: true,
                    _count: {
                        select: {
                            rooms: true,
                        },
                    },
                },
            });
        });
    }
    // Delete room type
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Delete related data first
                yield tx.availability.deleteMany({
                    where: { roomTypeId: id },
                });
                yield tx.peakRate.deleteMany({
                    where: { roomTypeId: id },
                });
                // Delete the room type
                yield tx.roomType.delete({
                    where: { id },
                });
            }));
        });
    }
    // Check if room type has assigned rooms
    hasAssignedRooms(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomCount = yield prisma.room.count({
                where: { roomTypeId },
            });
            return roomCount > 0;
        });
    }
    // Verify property ownership
    verifyPropertyOwnership(propertyId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const property = yield prisma.property.findFirst({
                where: {
                    id: propertyId,
                    OwnerId: ownerId,
                },
            });
            return !!property;
        });
    }
}
exports.default = new RoomTypeRepository();
