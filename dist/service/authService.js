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
const logger_1 = __importDefault(require("../utils/logger"));
const userRepository_1 = __importDefault(require("../repository/userRepository"));
const tokenService_1 = __importDefault(require("./tokenService"));
const passwordService_1 = __importDefault(require("./passwordService"));
const authNotificationService_1 = __importDefault(require("./authNotificationService"));
class AuthService {
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield userRepository_1.default.findByEmail(data.email);
                if (existingUser) {
                    throw new Error('User already exists with this email');
                }
                const { token, hashedToken, expires } = tokenService_1.default.generateVerificationToken();
                // Hash password if provided
                let hashedPassword;
                if (data.password) {
                    hashedPassword = yield passwordService_1.default.hashPassword(data.password);
                }
                const user = yield userRepository_1.default.create({
                    email: data.email,
                    role: data.role,
                    password: hashedPassword,
                    socialLogin: data.socialLogin || 'NONE',
                    verificationToken: hashedToken,
                    verificationExpires: expires,
                    isVerified: false
                });
                yield authNotificationService_1.default.sendVerificationEmail(user, token);
                const requiresPassword = !data.socialLogin || data.socialLogin === 'NONE';
                return { user, requiresPassword };
            }
            catch (error) {
                logger_1.default.error('Registration error:', error);
                throw error;
            }
        });
    }
    registerOwner(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.registerUser({ email, role: 'OWNER', password }).then(result => result.user);
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedToken = tokenService_1.default.hashToken(token);
                const user = yield userRepository_1.default.findByVerificationToken(hashedToken);
                if (!user) {
                    return {
                        success: false,
                        message: 'Invalid or expired verification token'
                    };
                }
                // Mark user as verified
                yield userRepository_1.default.update(user.id, { isVerified: true });
                yield userRepository_1.default.clearVerificationToken(user.id);
                yield authNotificationService_1.default.sendWelcomeEmail(user);
                return { success: true, message: 'Email verified successfully' };
            }
            catch (error) {
                logger_1.default.error('Email verification error:', error);
                throw error;
            }
        });
    }
    resendVerificationEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository_1.default.findByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }
                if (user.isVerified) {
                    throw new Error('User is already verified');
                }
                const { token, hashedToken, expires } = tokenService_1.default.generateVerificationToken();
                yield userRepository_1.default.setVerificationToken(user.id, hashedToken, expires);
                yield authNotificationService_1.default.sendVerificationEmail(user, token);
            }
            catch (error) {
                logger_1.default.error('Resend verification error:', error);
                throw error;
            }
        });
    }
    loginUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository_1.default.findByEmail(data.email, {
                    profile: true
                });
                if (!user) {
                    throw new Error('Invalid credentials');
                }
                if (data.socialLogin && data.socialLogin !== 'NONE') {
                    if (user.socialLogin !== data.socialLogin) {
                        throw new Error('Invalid social login method');
                    }
                }
                else {
                    if (!user.password) {
                        throw new Error('Password not set. Please use social login or set a password.');
                    }
                    if (!data.password) {
                        throw new Error('Password is required');
                    }
                    const isPasswordValid = yield passwordService_1.default.verifyPassword(data.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error('Invalid credentials');
                    }
                }
                if (!user.isVerified) {
                    throw new Error('Please verify your email before logging in');
                }
                const token = tokenService_1.default.generateJWTToken(user.id, user.role);
                return { user, token };
            }
            catch (error) {
                logger_1.default.error('Login error:', error);
                throw error;
            }
        });
    }
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository_1.default.findByEmail(email);
                if (!user) {
                    logger_1.default.info(`Password reset requested for non-existent email: ${email}`);
                    return;
                }
                if (user.socialLogin !== 'NONE') {
                    throw new Error('Password reset not available for social login accounts');
                }
                const { token, hashedToken, expires } = tokenService_1.default.generateVerificationToken();
                yield userRepository_1.default.setResetToken(user.id, hashedToken, expires);
                yield authNotificationService_1.default.sendPasswordResetEmail(user, token);
            }
            catch (error) {
                logger_1.default.error('Password reset request error:', error);
                throw error;
            }
        });
    }
    confirmPasswordReset(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedToken = tokenService_1.default.hashToken(data.token);
                const user = yield userRepository_1.default.findByResetToken(hashedToken);
                if (!user) {
                    throw new Error('Invalid or expired reset token');
                }
                const hashedPassword = yield passwordService_1.default.hashPassword(data.newPassword);
                yield userRepository_1.default.updatePassword(user.id, hashedPassword);
                yield userRepository_1.default.clearResetToken(user.id);
            }
            catch (error) {
                logger_1.default.error('Password reset confirmation error:', error);
                throw error;
            }
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userRepository_1.default.findById(userId, {
                    profile: {
                        include: {
                            avatar: true,
                            location: {
                                include: {
                                    city: {
                                        include: {
                                            province: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            catch (error) {
                logger_1.default.error('Get user error:', error);
                throw error;
            }
        });
    }
    verifyToken(token) {
        return tokenService_1.default.verifyJWTToken(token);
    }
}
exports.default = new AuthService();
