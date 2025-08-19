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
const logger_1 = __importDefault(require("../../utils/system/logger"));
const userProfileService_1 = __importDefault(require("../../service/user/userProfileService"));
const userOperationsService_1 = __importDefault(require("../../service/user/userOperationsService"));
const userControllerHelper_1 = __importDefault(require("../../helpers/user/userControllerHelper"));
const BaseController_1 = __importDefault(require("../BaseController"));
const user_1 = require("../../constants/controllers/user");
class UserController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.getProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = userControllerHelper_1.default.validateUserRequest(req);
                if (!userValidation.isValid) {
                    return this.handleAuthError(res, userValidation.error);
                }
                const user = yield userProfileService_1.default.getUserProfile(userValidation.userId);
                if (!user) {
                    return this.handleNotFoundError(res, "User");
                }
                const profileData = userProfileService_1.default.formatProfileData(user);
                logger_1.default.info(`User profile accessed by user ID: ${userValidation.userId}`);
                return this.handleSuccess(res, user_1.USER_SUCCESS_MESSAGES.PROFILE_RETRIEVED, profileData);
            }
            catch (error) {
                return this.handleError(res, error, "getting user profile");
            }
        });
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = userControllerHelper_1.default.validateUserRequest(req);
                if (!userValidation.isValid) {
                    return this.handleAuthError(res, userValidation.error);
                }
                const { sanitizedData, existingUser } = yield userControllerHelper_1.default.prepareProfileUpdateData(userValidation.userId, req.body);
                if (!existingUser) {
                    return this.handleNotFoundError(res, "User");
                }
                const updatedProfile = yield userProfileService_1.default.updateUserProfile(userValidation.userId, sanitizedData);
                return this.handleSuccess(res, user_1.USER_SUCCESS_MESSAGES.PROFILE_UPDATED, updatedProfile);
            }
            catch (error) {
                const specificErrors = userControllerHelper_1.default.getProfileUpdateErrorConfig();
                return this.handleError(res, error, "updating user profile", specificErrors);
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = userControllerHelper_1.default.validateUserRequest(req);
                if (!userValidation.isValid) {
                    return this.handleAuthError(res, userValidation.error);
                }
                const validation = userControllerHelper_1.default.validatePasswordRequest(req.body.currentPassword, req.body.newPassword);
                if (!validation.isValid) {
                    return this.handleValidationError(res, validation.errors[0]);
                }
                return yield this.processPasswordChange(req, res, userValidation.userId);
            }
            catch (error) {
                return this.handleError(res, error, "changing password");
            }
        });
        this.uploadAvatar = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = userControllerHelper_1.default.validateUserRequest(req);
                if (!userValidation.isValid) {
                    return this.handleAuthError(res, userValidation.error);
                }
                const fileValidation = userControllerHelper_1.default.validateAvatarFile(req.file);
                if (!fileValidation.isValid) {
                    return this.handleValidationError(res, fileValidation.errors[0]);
                }
                if (!userControllerHelper_1.default.isCloudinaryConfigValid()) {
                    const configError = userControllerHelper_1.default.getCloudinaryConfigError();
                    return this.handleError(res, new Error("configuration"), "uploading avatar", configError);
                }
                return yield this.processAvatarUpload(req, res, userValidation.userId);
            }
            catch (error) {
                return this.handleAvatarUploadError(res, error);
            }
        });
        this.reverifyEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = userControllerHelper_1.default.validateUserRequest(req);
                if (!userValidation.isValid) {
                    return this.handleAuthError(res, userValidation.error);
                }
                const { newEmail, user } = yield userControllerHelper_1.default.prepareEmailChangeData(userValidation.userId, req.body);
                if (!user) {
                    return this.handleNotFoundError(res, "User");
                }
                yield userOperationsService_1.default.executeEmailReverification(userValidation.userId, newEmail, user.email);
                return this.handleSuccess(res, user_1.USER_SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT);
            }
            catch (error) {
                return this.handleError(res, error, "reverifying email");
            }
        });
    }
    processPasswordChange(req, res, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { currentPassword, newPassword, user } = yield userControllerHelper_1.default.preparePasswordChangeData(userId, req.body);
            if (!user || !user.password) {
                return this.handleNotFoundError(res, "User");
            }
            yield userOperationsService_1.default.executePasswordChange(userId, currentPassword, newPassword, user.password);
            return this.handleSuccess(res, user_1.USER_SUCCESS_MESSAGES.PASSWORD_CHANGED);
        });
    }
    processAvatarUpload(req, res, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPicture = yield userOperationsService_1.default.executeAvatarUpload(req.file, userId);
            const avatarResponse = userControllerHelper_1.default.formatAvatarResponse(newPicture);
            return this.handleSuccess(res, user_1.USER_SUCCESS_MESSAGES.AVATAR_UPDATED, avatarResponse);
        });
    }
    handleAvatarUploadError(res, error) {
        const { message, statusCode } = userControllerHelper_1.default.formatAvatarUploadError(error);
        return this.handleError(res, { message }, "uploading avatar", {
            [message]: { message, statusCode },
        });
    }
}
exports.default = new UserController();
