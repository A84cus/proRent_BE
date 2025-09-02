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
const logger_1 = __importDefault(require("../../utils/system/logger"));
class RoomGalleryService {
    // Verify room ownership through property ownership
    verifyRoomOwnership(roomId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const room = yield prisma_1.default.room.findFirst({
                    where: {
                        id: roomId,
                        property: {
                            OwnerId: ownerId,
                        },
                    },
                });
                return !!room;
            }
            catch (error) {
                logger_1.default.error("Error verifying room ownership:", error);
                throw error;
            }
        });
    }
    // Add picture to room gallery
    addToGallery(roomId, pictureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if picture exists
                const picture = yield prisma_1.default.picture.findUnique({
                    where: { id: pictureId },
                });
                if (!picture) {
                    throw new Error("Picture not found");
                }
                // Check if already in gallery
                const existing = yield prisma_1.default.roomPicture.findUnique({
                    where: {
                        roomId_pictureId: {
                            roomId,
                            pictureId,
                        },
                    },
                });
                if (existing) {
                    throw new Error("Picture already in gallery");
                }
                // Add to gallery
                const result = yield prisma_1.default.roomPicture.create({
                    data: {
                        roomId,
                        pictureId,
                    },
                    include: {
                        picture: true,
                    },
                });
                logger_1.default.info(`Picture ${pictureId} added to room ${roomId} gallery`);
                return result;
            }
            catch (error) {
                logger_1.default.error("Error adding picture to room gallery:", error);
                throw error;
            }
        });
    }
    // Remove picture from room gallery
    removeFromGallery(roomId, pictureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield prisma_1.default.roomPicture.delete({
                    where: {
                        roomId_pictureId: {
                            roomId,
                            pictureId,
                        },
                    },
                });
                logger_1.default.info(`Picture ${pictureId} removed from room ${roomId} gallery`);
            }
            catch (error) {
                if (error &&
                    typeof error === "object" &&
                    "code" in error &&
                    error.code === "P2025") {
                    throw new Error("Picture not found in gallery");
                }
                logger_1.default.error("Error removing picture from room gallery:", error);
                throw error;
            }
        });
    }
    // Get room gallery
    getRoomGallery(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gallery = yield prisma_1.default.roomPicture.findMany({
                    where: { roomId },
                    include: {
                        picture: true,
                    },
                    orderBy: {
                        picture: {
                            createdAt: "asc",
                        },
                    },
                });
                return gallery;
            }
            catch (error) {
                logger_1.default.error("Error getting room gallery:", error);
                throw error;
            }
        });
    }
}
exports.default = new RoomGalleryService();
