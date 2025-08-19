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
const userProfileService_1 = __importDefault(require("../service/user/userProfileService"));
const userAuthService_1 = __importDefault(require("../service/auth/userAuthService"));
const avatarUploadService_1 = __importDefault(require("../service/upload/avatarUploadService"));
const emailVerificationService_1 = __importDefault(require("../service/email/emailVerificationService"));
const userValidationHelper_1 = __importDefault(require("./userValidationHelper"));
class UserControllerHelper {
    validateUserRequest(req) {
        const user = req.user;
        if (!user || !user.id) {
            return {
                isValid: false,
                error: "User not authenticated",
            };
        }
        return {
            isValid: true,
            userId: user.id,
        };
    }
    prepareProfileUpdateData(userId, requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const sanitizedData = userValidationHelper_1.default.sanitizeInput(requestBody);
            const existingUser = yield userProfileService_1.default.checkUserExists(userId);
            return {
                sanitizedData,
                existingUser,
            };
        });
    }
    validatePasswordRequest(currentPassword, newPassword) {
        return userAuthService_1.default.validatePasswordChangeRequest(currentPassword, newPassword);
    }
    preparePasswordChangeData(userId, requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const { currentPassword, newPassword } = requestBody;
            const user = yield userAuthService_1.default.getUserWithPassword(userId);
            return {
                currentPassword,
                newPassword,
                user,
            };
        });
    }
    validateAvatarFile(file) {
        return avatarUploadService_1.default.validateFile(file);
    }
    isCloudinaryConfigValid() {
        return avatarUploadService_1.default.validateCloudinaryConfig();
    }
    prepareEmailChangeData(userId, requestBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newEmail } = userValidationHelper_1.default.sanitizeInput(requestBody);
            const user = yield emailVerificationService_1.default.getUserForVerification(userId);
            return {
                newEmail,
                user,
            };
        });
    }
    formatAvatarResponse(picture) {
        return {
            avatar: {
                id: picture.id,
                url: picture.url,
                alt: picture.alt,
            },
        };
    }
    getProfileUpdateErrorConfig() {
        return {
            "Invalid birth date format": {
                message: "Invalid birth date format",
                statusCode: 400,
            },
        };
    }
    getCloudinaryConfigError() {
        return {
            configuration: {
                message: "Image upload service is not properly configured. Please contact administrator.",
                statusCode: 500,
            },
        };
    }
    formatAvatarUploadError(error) {
        const errorMessage = avatarUploadService_1.default.handleCloudinaryError(error);
        const statusCode = errorMessage.includes("configuration") ? 500 : 400;
        return {
            message: errorMessage,
            statusCode,
        };
    }
}
exports.default = new UserControllerHelper();
