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
const authService_1 = __importDefault(require("../../service/auth/authService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const errorHandler_1 = require("../../helpers/system/errorHandler");
const auth_1 = require("../../constants/controllers/auth");
const validations_1 = require("../../validations");
class AuthController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.registerUserSchema.parse(req.body);
                const result = yield authService_1.default.registerUser(validatedData);
                logger_1.default.info(`User registration initiated for email: ${validatedData.email}`);
                logger_1.default.info(`User created with verification token: ${result.user.verificationToken ? "YES" : "NO"}, expires: ${result.user.verificationExpires}`);
                res.status(201).json({
                    success: true,
                    message: auth_1.AUTH_SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
                    data: {
                        userId: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        requiresPassword: result.requiresPassword,
                        isVerified: result.user.isVerified,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "User registration");
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Support both GET (query params) and POST (body) requests
                const isGetRequest = req.method === "GET";
                const dataSource = isGetRequest ? req.query : req.body;
                const validatedData = validations_1.verifyEmailSchema.parse(dataSource);
                logger_1.default.info(`Attempting to verify email with token: ${validatedData.token}`);
                const result = yield authService_1.default.verifyEmail(validatedData.token, validatedData.password);
                if (result.success) {
                    logger_1.default.info("Email verification successful");
                    res.status(200).json({
                        success: true,
                        message: result.message,
                        data: {
                            requiresRedirect: result.requiresRedirect || false,
                        },
                    });
                }
                else {
                    logger_1.default.warn(`Email verification failed: ${result.message}`);
                    res.status(400).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Email verification");
            }
        });
    }
    resendVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.resendVerificationSchema.parse(req.body);
                yield authService_1.default.resendVerificationEmail(validatedData.email);
                logger_1.default.info(`Verification email resent to: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: auth_1.AUTH_SUCCESS_MESSAGES.VERIFICATION_EMAIL_SENT,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Resend verification");
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.loginSchema.parse(req.body);
                const result = yield authService_1.default.loginUser(validatedData);
                logger_1.default.info(`User logged in: ${validatedData.email}`);
                const redirectUrl = result.user.role === "OWNER" ? "/dashboard/owner" : "/dashboard/user";
                res.status(200).json({
                    success: true,
                    message: auth_1.AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS,
                    data: {
                        user: {
                            id: result.user.id,
                            email: result.user.email,
                            role: result.user.role,
                            isVerified: result.user.isVerified,
                        },
                        token: result.token,
                        redirectUrl,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleAuthError)(res, error, "Login");
            }
        });
    }
    resetPasswordRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.resetPasswordRequestSchema.parse(req.body);
                yield authService_1.default.requestPasswordReset(validatedData.email);
                logger_1.default.info(`Password reset requested for: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: auth_1.AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Password reset request");
            }
        });
    }
    resetPasswordConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.resetPasswordConfirmSchema.parse(req.body);
                yield authService_1.default.confirmPasswordReset(validatedData);
                logger_1.default.info("Password reset completed successfully");
                res.status(200).json({
                    success: true,
                    message: auth_1.AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Password reset confirm");
            }
        });
    }
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res
                        .status(401)
                        .json({ success: false, message: auth_1.AUTH_ERROR_MESSAGES.UNAUTHORIZED });
                }
                const user = yield authService_1.default.getUserById(req.user.userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: auth_1.AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
                    });
                }
                res.status(200).json({
                    success: true,
                    data: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        isVerified: user.isVerified,
                        socialLogin: user.socialLogin,
                        createdAt: user.createdAt,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Get current user");
            }
        });
    }
    /**
     * Login or register user using OAuth provider (Google, etc.)
     *
     * Expected request body:
     * {
     *   "email": "user@example.com",
     *   "emailVerified": true,
     *   "providerId": "google.com",
     *   "federatedId": "https://accounts.google.com/115638852868856441323",
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "fullName": "John Doe",
     *   "displayName": "John Doe",
     *   "photoUrl": "https://example.com/photo.jpg",
     *   "idToken": "eyJhbGciOiJSUzI1NiIs...",
     *   "role": "USER" // optional, defaults to USER
     * }
     *
     * Response:
     * - If new user: Creates account and profile, returns user data and JWT token
     * - If existing user: Updates profile if needed, returns user data and JWT token
     */
    loginWithProvider(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.loginWithProviderSchema.parse(req.body);
                // Check if email is verified from the provider
                if (!validatedData.emailVerified) {
                    return res.status(400).json({
                        success: false,
                        message: "Email not verified by provider",
                    });
                }
                const result = yield authService_1.default.loginWithProvider(validatedData);
                logger_1.default.info(`Provider login ${result.isNewUser ? "registered and logged in" : "logged in"} for email: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: result.isNewUser
                        ? auth_1.AUTH_SUCCESS_MESSAGES.REGISTRATION_SUCCESS
                        : auth_1.AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS,
                    data: {
                        userId: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        isVerified: result.user.isVerified,
                        socialLogin: result.user.socialLogin,
                        isNewUser: result.isNewUser,
                    },
                    token: result.token,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleAuthError)(res, error, "Provider login");
            }
        });
    }
    validateToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.verifyEmailSchema.parse(req.body);
                const result = yield authService_1.default.validateVerificationToken(validatedData.token);
                if (result.valid) {
                    logger_1.default.info("Token validation successful");
                    res.status(200).json({
                        success: true,
                        message: result.message,
                        data: {
                            valid: true,
                            userEmail: result.userEmail,
                        },
                    });
                }
                else {
                    res.status(400).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Token validation");
            }
        });
    }
    checkEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.checkEmailSchema.parse(req.body);
                const result = yield authService_1.default.checkEmailExists(validatedData.email);
                logger_1.default.info(`Email check performed for: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: "Email check completed",
                    data: {
                        email: validatedData.email,
                        exists: result.exists,
                        isVerified: result.isVerified,
                        socialLogin: result.socialLogin,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Email check");
            }
        });
    }
}
exports.default = new AuthController();
