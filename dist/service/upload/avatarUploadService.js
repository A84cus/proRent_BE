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
const cloudinary_1 = __importDefault(require("../../config/third-party/cloudinary"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const uploadValidation_1 = require("../../validations/upload/uploadValidation");
const prisma_1 = __importDefault(require("../../prisma"));
class AvatarUploadService {
    // Validate file using centralized validation
    validateFile(file) {
        if (!file) {
            return {
                isValid: false,
                errors: ['No file uploaded. Please select an image file to upload.']
            };
        }
        // Use centralized validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 1048576; // 1MB
        const typeValidation = (0, uploadValidation_1.validateFileType)(file, allowedTypes);
        const sizeValidation = (0, uploadValidation_1.validateFileSize)(file, maxSize);
        const errors = [];
        if (!typeValidation.isValid) {
            errors.push(typeValidation.error);
        }
        if (!sizeValidation.isValid) {
            errors.push(sizeValidation.error);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Check Cloudinary configuration
    validateCloudinaryConfig() {
        if (!cloudinary_1.default.config().cloud_name || !cloudinary_1.default.config().api_key || !cloudinary_1.default.config().api_secret) {
            logger_1.default.error('Cloudinary configuration missing');
            return false;
        }
        return true;
    }
    // Upload file to Cloudinary
    uploadToCloudinary(file, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                cloudinary_1.default.uploader
                    .upload_stream({
                    resource_type: 'image',
                    folder: 'prorent/avatars',
                    public_id: `avatar_${userId}_${Date.now()}`,
                    width: 300,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto'
                }, (error, result) => {
                    if (error) {
                        logger_1.default.error('Cloudinary upload error:', error);
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                })
                    .end(file.buffer);
            });
        });
    }
    // Save picture to database
    savePicture(cloudinaryResult, userId, fileSize) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.picture.create({
                data: {
                    url: cloudinaryResult.secure_url,
                    alt: `Profile picture for ${userId}`,
                    type: 'profile',
                    sizeKB: Math.round(fileSize / 1024)
                }
            });
        });
    }
    // Update user profile with new avatar
    updateUserAvatar(userId, pictureId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.profile.upsert({
                where: { userId },
                update: { avatarId: pictureId },
                create: {
                    userId,
                    avatarId: pictureId
                }
            });
        });
    }
    // Handle Cloudinary errors
    handleCloudinaryError(error) {
        if (error.message && error.message.includes('Invalid Signature')) {
            return 'Image upload service configuration error. Please try again later.';
        }
        if (error.message && error.message.includes('Invalid image')) {
            return 'Invalid image file. Please upload a valid image.';
        }
        return 'Error uploading image. Please try again.';
    }
}
exports.default = new AvatarUploadService();
