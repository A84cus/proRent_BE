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
class PropertyGalleryService {
    // Verify property ownership
    verifyPropertyOwnership(propertyId, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const property = yield prisma_1.default.property.findFirst({
                    where: {
                        id: propertyId,
                        OwnerId: ownerId,
                    },
                });
                return !!property;
            }
            catch (error) {
                logger_1.default.error("Error verifying property ownership:", error);
                throw error;
            }
        });
    }
    // Add picture to property gallery
    addToGallery(propertyId, pictureId) {
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
                const existing = yield prisma_1.default.propertyPicture.findUnique({
                    where: {
                        propertyId_pictureId: {
                            propertyId,
                            pictureId,
                        },
                    },
                });
                if (existing) {
                    throw new Error("Picture already in gallery");
                }
                // Add to gallery
                const result = yield prisma_1.default.propertyPicture.create({
                    data: {
                        propertyId,
                        pictureId,
                    },
                    include: {
                        picture: true,
                    },
                });
                logger_1.default.info(`Picture ${pictureId} added to property ${propertyId} gallery`);
                return result;
            }
            catch (error) {
                logger_1.default.error("Error adding picture to gallery:", error);
                throw error;
            }
        });
    }
    // Remove picture from property gallery
    removeFromGallery(propertyId, pictureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield prisma_1.default.propertyPicture.delete({
                    where: {
                        propertyId_pictureId: {
                            propertyId,
                            pictureId,
                        },
                    },
                });
                logger_1.default.info(`Picture ${pictureId} removed from property ${propertyId} gallery`);
            }
            catch (error) {
                if (error &&
                    typeof error === "object" &&
                    "code" in error &&
                    error.code === "P2025") {
                    throw new Error("Picture not found in gallery");
                }
                logger_1.default.error("Error removing picture from gallery:", error);
                throw error;
            }
        });
    }
    // Get property gallery
    getGallery(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gallery = yield prisma_1.default.propertyPicture.findMany({
                    where: { propertyId },
                    include: {
                        picture: true,
                    },
                    orderBy: {
                        picture: {
                            uploadedAt: "desc",
                        },
                    },
                });
                return gallery.map((item) => item.picture);
            }
            catch (error) {
                logger_1.default.error("Error fetching property gallery:", error);
                throw error;
            }
        });
    }
}
exports.default = new PropertyGalleryService();
