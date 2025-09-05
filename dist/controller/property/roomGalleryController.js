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
const roomGalleryService_1 = __importDefault(require("../../service/property/roomGalleryService"));
const responseHelper_1 = __importDefault(require("../../helpers/system/responseHelper"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const BaseController_1 = __importDefault(require("../BaseController"));
class RoomGalleryController extends BaseController_1.default {
    // POST /api/owner/rooms/:roomId/gallery - Add image to room gallery
    addToGallery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "Unauthorized", undefined, 401);
                    return;
                }
                const { roomId } = req.params;
                const { pictureId } = req.body;
                if (!roomId || !pictureId) {
                    responseHelper_1.default.error(res, "Room ID and Picture ID are required", undefined, 400);
                    return;
                }
                // Check if room belongs to user's property
                const hasAccess = yield roomGalleryService_1.default.verifyRoomOwnership(roomId, userValidation.userId);
                if (!hasAccess) {
                    responseHelper_1.default.error(res, "Room not found or unauthorized", undefined, 404);
                    return;
                }
                // Add to gallery
                const result = yield roomGalleryService_1.default.addToGallery(roomId, pictureId);
                responseHelper_1.default.success(res, "Image added to room gallery successfully", result);
            }
            catch (error) {
                logger_1.default.error("Error adding image to room gallery:", error);
                responseHelper_1.default.error(res, "Failed to add image to room gallery", undefined, 500);
            }
        });
    }
    // DELETE /api/owner/rooms/:roomId/gallery/:pictureId - Remove image from room gallery
    removeFromGallery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "Unauthorized", undefined, 401);
                    return;
                }
                const { roomId, pictureId } = req.params;
                // Check if room belongs to user's property
                const hasAccess = yield roomGalleryService_1.default.verifyRoomOwnership(roomId, userValidation.userId);
                if (!hasAccess) {
                    responseHelper_1.default.error(res, "Room not found or unauthorized", undefined, 404);
                    return;
                }
                // Remove from gallery
                yield roomGalleryService_1.default.removeFromGallery(roomId, pictureId);
                responseHelper_1.default.success(res, "Image removed from room gallery successfully", null);
            }
            catch (error) {
                logger_1.default.error("Error removing image from room gallery:", error);
                responseHelper_1.default.error(res, "Failed to remove image from room gallery", undefined, 500);
            }
        });
    }
}
exports.default = new RoomGalleryController();
