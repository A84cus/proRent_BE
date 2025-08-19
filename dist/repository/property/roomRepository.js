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
class RoomRepository {
    // Get all rooms by property ID
    findAllByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.room.findMany({
                where: { propertyId },
                include: {
                    roomType: true,
                    property: {
                        select: {
                            id: true,
                            name: true,
                            OwnerId: true,
                        },
                    },
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                    _count: {
                        select: {
                            reservations: true,
                            availabilities: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    // Find room by ID with full details
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.room.findUnique({
                where: { id },
                include: {
                    roomType: true,
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
                    availabilities: true,
                    _count: {
                        select: {
                            reservations: true,
                            availabilities: true,
                        },
                    },
                },
            });
        });
    }
    // Find room by ID and check property ownership
    findByIdAndOwner(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.room.findFirst({
                where: {
                    id,
                    property: {
                        OwnerId: ownerId,
                    },
                },
                include: {
                    roomType: true,
                    property: true,
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                },
            });
        });
    }
    // Create room with room type
    createWithRoomType(roomData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // First, create or get the room type
                let roomType = yield tx.roomType.findFirst({
                    where: {
                        propertyId: roomData.propertyId,
                        name: roomData.roomTypeName,
                    },
                });
                if (!roomType) {
                    roomType = yield tx.roomType.create({
                        data: {
                            propertyId: roomData.propertyId,
                            name: roomData.roomTypeName,
                            description: roomData.description,
                            basePrice: roomData.basePrice,
                            capacity: roomData.capacity,
                            totalQuantity: 1,
                            isWholeUnit: false,
                        },
                    });
                }
                else {
                    // Just increment quantity, don't override other properties
                    roomType = yield tx.roomType.update({
                        where: { id: roomType.id },
                        data: {
                            totalQuantity: roomType.totalQuantity + 1,
                        },
                    });
                }
                // Create the room
                const room = yield tx.room.create({
                    data: {
                        name: roomData.name,
                        propertyId: roomData.propertyId,
                        roomTypeId: roomType.id,
                    },
                    include: {
                        roomType: true,
                        property: true,
                    },
                });
                // Add pictures if provided
                if (roomData.pictures && roomData.pictures.length > 0) {
                    const roomPictures = roomData.pictures.map((pictureId) => ({
                        roomId: room.id,
                        pictureId: pictureId,
                    }));
                    yield tx.roomPicture.createMany({
                        data: roomPictures,
                    });
                }
                return room;
            }));
        });
    }
    // Update room and room type
    updateRoomAndType(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const room = yield tx.room.findUnique({
                    where: { id },
                    include: { roomType: true },
                });
                if (!room) {
                    throw new Error("Room not found");
                }
                // Update room name if provided
                if (updateData.name) {
                    yield tx.room.update({
                        where: { id },
                        data: { name: updateData.name },
                    });
                }
                // Update room type if price, capacity, or description provided
                if (updateData.basePrice !== undefined ||
                    updateData.capacity !== undefined ||
                    updateData.description !== undefined) {
                    yield tx.roomType.update({
                        where: { id: room.roomTypeId },
                        data: Object.assign(Object.assign(Object.assign({}, (updateData.description !== undefined && {
                            description: updateData.description,
                        })), (updateData.basePrice !== undefined && {
                            basePrice: updateData.basePrice,
                        })), (updateData.capacity !== undefined && {
                            capacity: updateData.capacity,
                        })),
                    });
                }
                // Update pictures if provided
                if (updateData.pictures) {
                    // Delete existing pictures
                    yield tx.roomPicture.deleteMany({
                        where: { roomId: id },
                    });
                    // Add new pictures
                    if (updateData.pictures.length > 0) {
                        const roomPictures = updateData.pictures.map((pictureId) => ({
                            roomId: id,
                            pictureId: pictureId,
                        }));
                        yield tx.roomPicture.createMany({
                            data: roomPictures,
                        });
                    }
                }
                // Return updated room with includes
                return tx.room.findUnique({
                    where: { id },
                    include: {
                        roomType: true,
                        property: true,
                        gallery: {
                            include: {
                                picture: true,
                            },
                        },
                    },
                });
            }));
        });
    }
    // Delete room
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const room = yield tx.room.findUnique({
                    where: { id },
                    include: { roomType: true },
                });
                if (!room) {
                    throw new Error("Room not found");
                }
                // Delete room pictures first
                yield tx.roomPicture.deleteMany({
                    where: { roomId: id },
                });
                // Delete room availabilities
                yield tx.availability.deleteMany({
                    where: { roomId: id },
                });
                // Delete the room
                yield tx.room.delete({
                    where: { id },
                });
                // Update room type quantity
                yield tx.roomType.update({
                    where: { id: room.roomTypeId },
                    data: {
                        totalQuantity: Math.max(0, room.roomType.totalQuantity - 1),
                    },
                });
                // If this was the last room of this type, consider deleting the room type
                const remainingRooms = yield tx.room.count({
                    where: { roomTypeId: room.roomTypeId },
                });
                if (remainingRooms === 0) {
                    // Delete room type availabilities and peak rates
                    yield tx.availability.deleteMany({
                        where: { roomTypeId: room.roomTypeId },
                    });
                    yield tx.peakRate.deleteMany({
                        where: { roomTypeId: room.roomTypeId },
                    });
                    // Delete the room type
                    yield tx.roomType.delete({
                        where: { id: room.roomTypeId },
                    });
                }
            }));
        });
    }
    // Check if room has active bookings
    hasActiveBookings(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeBookingCount = yield prisma.reservation.count({
                where: {
                    roomId,
                    orderStatus: {
                        in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                    },
                    deletedAt: null,
                },
            });
            return activeBookingCount > 0;
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
exports.default = new RoomRepository();
