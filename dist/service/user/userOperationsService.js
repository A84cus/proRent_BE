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
const userAuthService_1 = __importDefault(require("../auth/userAuthService"));
const avatarUploadService_1 = __importDefault(require("../upload/avatarUploadService"));
const emailVerificationService_1 = __importDefault(require("../email/emailVerificationService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
class UserOperationsService {
    // Handle complete password change workflow
    executePasswordChange(userId, currentPassword, newPassword, userPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCurrentPasswordValid = yield userAuthService_1.default.verifyCurrentPassword(currentPassword, userPassword);
            if (!isCurrentPasswordValid) {
                throw new Error("Current password is incorrect");
            }
            const passwordValidation = userAuthService_1.default.validateNewPassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.errors.join(", "));
            }
            const hashedNewPassword = yield userAuthService_1.default.hashNewPassword(newPassword);
            yield userAuthService_1.default.updateUserPassword(userId, hashedNewPassword);
        });
    }
    // Handle complete avatar upload workflow
    executeAvatarUpload(file, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cloudinaryResult = yield avatarUploadService_1.default.uploadToCloudinary(file, userId);
            const newPicture = yield avatarUploadService_1.default.savePicture(cloudinaryResult, userId, file.size);
            yield avatarUploadService_1.default.updateUserAvatar(userId, newPicture.id);
            logger_1.default.info(`Avatar uploaded for user ID: ${userId}`);
            return newPicture;
        });
    }
    // Handle complete email reverification workflow
    executeEmailReverification(userId, newEmail, currentEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailValidation = emailVerificationService_1.default.validateEmailChangeRequest(newEmail, currentEmail);
            if (!emailValidation.isValid) {
                throw new Error(emailValidation.errors[0]);
            }
            const isEmailAvailable = yield emailVerificationService_1.default.checkEmailAvailability(newEmail, userId);
            if (!isEmailAvailable) {
                throw new Error("Email is already taken");
            }
            yield emailVerificationService_1.default.processEmailVerification(userId, newEmail);
        });
    }
}
exports.default = new UserOperationsService();
