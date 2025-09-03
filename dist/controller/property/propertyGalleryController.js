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
const propertyGalleryService_1 = __importDefault(require("../../service/property/propertyGalleryService"));
const responseHelper_1 = __importDefault(require("../../helpers/system/responseHelper"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const BaseController_1 = __importDefault(require("../BaseController"));
class PropertyGalleryController extends BaseController_1.default {
    // POST /api/owner/properties/:propertyId/gallery - Add image to property gallery
    addToGallery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "Unauthorized", undefined, 401);
                    return;
                }
                const { propertyId } = req.params;
                const { pictureId } = req.body;
                if (!propertyId || !pictureId) {
                    responseHelper_1.default.error(res, "Property ID and Picture ID are required", undefined, 400);
                    return;
                }
                // Check if property belongs to user
                const propertyExists = yield propertyGalleryService_1.default.verifyPropertyOwnership(propertyId, userValidation.userId);
                if (!propertyExists) {
                    responseHelper_1.default.error(res, "Property not found or unauthorized", undefined, 404);
                    return;
                }
                // Add to gallery
                const result = yield propertyGalleryService_1.default.addToGallery(propertyId, pictureId);
                responseHelper_1.default.success(res, "Image added to gallery successfully", result);
            }
            catch (error) {
                logger_1.default.error("Error adding image to gallery:", error);
                responseHelper_1.default.error(res, "Failed to add image to gallery", undefined, 500);
            }
        });
    }
    // DELETE /api/owner/properties/:propertyId/gallery/:pictureId - Remove image from gallery
    removeFromGallery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "Unauthorized", undefined, 401);
                    return;
                }
                const { propertyId, pictureId } = req.params;
                // Check if property belongs to user
                const propertyExists = yield propertyGalleryService_1.default.verifyPropertyOwnership(propertyId, userValidation.userId);
                if (!propertyExists) {
                    responseHelper_1.default.error(res, "Property not found or unauthorized", undefined, 404);
                    return;
                }
                // Remove from gallery
                yield propertyGalleryService_1.default.removeFromGallery(propertyId, pictureId);
                responseHelper_1.default.success(res, "Image removed from gallery successfully", null);
            }
            catch (error) {
                logger_1.default.error("Error removing image from gallery:", error);
                responseHelper_1.default.error(res, "Failed to remove image from gallery", undefined, 500);
            }
        });
    }
    // PATCH /api/owner/properties/:propertyId/gallery/:pictureId/set-main - Set image as main picture
    setMainPicture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "Unauthorized", undefined, 401);
                    return;
                }
                const { propertyId, pictureId } = req.params;
                // Check if property belongs to user
                const propertyExists = yield propertyGalleryService_1.default.verifyPropertyOwnership(propertyId, userValidation.userId);
                if (!propertyExists) {
                    responseHelper_1.default.error(res, "Property not found or unauthorized", undefined, 404);
                    return;
                }
                // Set as main picture
                const result = yield propertyGalleryService_1.default.setMainPicture(propertyId, pictureId);
                responseHelper_1.default.success(res, "Main picture updated successfully", result);
            }
            catch (error) {
                logger_1.default.error("Error setting main picture:", error);
                responseHelper_1.default.error(res, "Failed to set main picture", undefined, 500);
            }
        });
    }
}
exports.default = new PropertyGalleryController();
