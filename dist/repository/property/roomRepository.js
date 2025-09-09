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
class RoomRepository {
    // Get all rooms by property ID
    findAllByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.room.findMany({
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
            return prisma_1.default.room.findUnique({
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
            return prisma_1.default.room.findFirst({
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
    // Create room (simple room creation)
    create(roomData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Verify roomType exists and belongs to the property
                const roomType = yield tx.roomType.findFirst({
                    where: {
                        id: roomData.roomTypeId,
                        propertyId: roomData.propertyId,
                    },
                });
                if (!roomType) {
                    throw new Error("Room type not found or doesn't belong to this property");
                }
                // Create the room
                const room = yield tx.room.create({
                    data: {
                        name: roomData.name,
                        propertyId: roomData.propertyId,
                        roomTypeId: roomData.roomTypeId,
                    },
                    include: {
                        roomType: true,
                        property: true,
                    },
                });
                // Note: totalQuantity in RoomType represents the maximum capacity
                // and should be set when creating the RoomType, not automatically incremented
                // Add pictures if provided
                if (roomData.pictures && roomData.pictures.length > 0) {
                    const roomPictures = roomData.pictures.map((pictureId) => ({
                        roomId: room.id,
                        pictureId,
                    }));
                    yield tx.roomPicture.createMany({
                        data: roomPictures,
                    });
                }
                return room;
            }));
        });
    }
    // Update room (only room-specific fields)
    update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const room = yield tx.room.findUnique({
                    where: { id },
                    include: { roomType: true },
                });
                if (!room) {
                    throw new Error("Room not found");
                }
                // Update room fields
                const updatedRoom = yield tx.room.update({
                    where: { id },
                    data: Object.assign(Object.assign(Object.assign({}, (updateData.name !== undefined && { name: updateData.name })), (updateData.isAvailable !== undefined && {
                        isAvailable: updateData.isAvailable,
                    })), (updateData.roomTypeId !== undefined && {
                        roomTypeId: updateData.roomTypeId,
                    })),
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
                // Update pictures if provided
                if (updateData.pictures !== undefined) {
                    // Delete existing pictures
                    yield tx.roomPicture.deleteMany({
                        where: { roomId: id },
                    });
                    // Add new pictures
                    if (updateData.pictures.length > 0) {
                        const roomPictures = updateData.pictures.map((pictureId) => ({
                            roomId: id,
                            pictureId,
                        }));
                        yield tx.roomPicture.createMany({
                            data: roomPictures,
                        });
                    }
                }
                return updatedRoom;
            }));
        });
    }
    // Verify room type ownership
    verifyRoomTypeOwnership(roomTypeId, propertyId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomType = yield prisma_1.default.roomType.findFirst({
                where: {
                    id: roomTypeId,
                    propertyId,
                    property: {
                        OwnerId: ownerId,
                    },
                },
            });
            return !!roomType;
        });
    }
    // Delete room
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
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
                // Note: We don't automatically decrease totalQuantity in RoomType
                // because totalQuantity represents the capacity, not actual count
                // If this was the last room of this type, consider deleting the room type
                const remainingRooms = yield tx.room.count({
                    where: { roomTypeId: room.roomTypeId },
                });
                // Optional: Clean up room type if no rooms remain
                // This is business logic decision - maybe keep room types for future use
                if (remainingRooms === 0) {
                    // Delete room type availabilities and peak rates
                    yield tx.availability.deleteMany({
                        where: { roomTypeId: room.roomTypeId },
                    });
                    yield tx.peakRate.deleteMany({
                        where: { roomTypeId: room.roomTypeId },
                    });
                    // Note: We don't auto-delete room type here
                    // That should be a separate business decision
                }
            }));
        });
    }
    // Check if room has active bookings
    hasActiveBookings(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeBookingCount = yield prisma_1.default.reservation.count({
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
            const property = yield prisma_1.default.property.findFirst({
                where: {
                    id: propertyId,
                    OwnerId: ownerId,
                },
            });
            return !!property;
        });
    }
    // Count rooms by room type ID
    countRoomsByRoomType(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.room.count({
                where: { roomTypeId },
            });
        });
    }
    // Find all rooms by room type ID
    findAllByRoomType(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.room.findMany({
                where: { roomTypeId },
                orderBy: { createdAt: "desc" },
            });
        });
    }
}
exports.default = new RoomRepository();
