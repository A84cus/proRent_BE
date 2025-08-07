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
const authService_1 = __importDefault(require("../service/authService"));
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../helpers/errorHandler");
const authValidation_1 = require("../validations/authValidation");
class AuthController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.registerUserSchema.parse(req.body);
                const result = yield authService_1.default.registerUser(validatedData);
                logger_1.default.info(`User registration initiated for email: ${validatedData.email}`);
                res.status(201).json({
                    success: true,
                    message: 'Registration successful. Please check your email for verification.',
                    data: {
                        userId: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        requiresPassword: result.requiresPassword,
                        isVerified: result.user.isVerified
                    }
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'User registration');
            }
        });
    }
    registerTenant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.registerTenantSchema.parse(req.body);
                const user = yield authService_1.default.registerTenant(validatedData.email);
                logger_1.default.info(`Tenant registration initiated for email: ${validatedData.email}`);
                res.status(201).json({
                    success: true,
                    message: 'Tenant registration successful. Please check your email for verification.',
                    data: {
                        userId: user.id,
                        email: user.email,
                        role: user.role,
                        isVerified: user.isVerified
                    }
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Tenant registration');
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.verifyEmailSchema.parse(req.query);
                const result = yield authService_1.default.verifyEmail(validatedData.token);
                if (result.success) {
                    logger_1.default.info('Email verification successful');
                    res.status(200).json({ success: true, message: result.message });
                }
                else {
                    res.status(400).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Email verification');
            }
        });
    }
    resendVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.resendVerificationSchema.parse(req.body);
                yield authService_1.default.resendVerificationEmail(validatedData.email);
                logger_1.default.info(`Verification email resent to: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: 'Verification email sent successfully'
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Resend verification');
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.loginSchema.parse(req.body);
                const result = yield authService_1.default.loginUser(validatedData);
                logger_1.default.info(`User logged in: ${validatedData.email}`);
                const redirectUrl = result.user.role === 'OWNER' ? '/dashboard/tenant' : '/dashboard/user';
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: result.user.id,
                            email: result.user.email,
                            role: result.user.role,
                            isVerified: result.user.isVerified
                        },
                        token: result.token,
                        redirectUrl
                    }
                });
            }
            catch (error) {
                (0, errorHandler_1.handleAuthError)(res, error, 'Login');
            }
        });
    }
    resetPasswordRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.resetPasswordRequestSchema.parse(req.body);
                yield authService_1.default.requestPasswordReset(validatedData.email);
                logger_1.default.info(`Password reset requested for: ${validatedData.email}`);
                res.status(200).json({
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Password reset request');
            }
        });
    }
    resetPasswordConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = authValidation_1.resetPasswordConfirmSchema.parse(req.body);
                yield authService_1.default.confirmPasswordReset(validatedData);
                logger_1.default.info('Password reset completed successfully');
                res.status(200).json({
                    success: true,
                    message: 'Password reset successful. You can now login with your new password.'
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Password reset confirm');
            }
        });
    }
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ success: false, message: 'Unauthorized' });
                }
                const user = yield authService_1.default.getUserById(req.user.userId);
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }
                res.status(200).json({
                    success: true,
                    data: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        isVerified: user.isVerified,
                        socialLogin: user.socialLogin,
                        createdAt: user.createdAt
                    }
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, 'Get current user');
            }
        });
    }
}
exports.default = new AuthController();
