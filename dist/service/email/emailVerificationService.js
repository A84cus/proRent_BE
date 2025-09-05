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
const emailService_1 = __importDefault(require("./emailService"));
const tokenService_1 = __importDefault(require("../auth/tokenService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const prisma_1 = __importDefault(require("../../prisma"));
class EmailVerificationService {
    // Validate email format
    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Check if email is already taken
    checkEmailAvailability(email, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { email }
            });
            return !existingUser || existingUser.id === currentUserId;
        });
    }
    // Get user for email verification
    getUserForVerification(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });
        });
    }
    // Update user email and set verification token
    updateUserEmail(userId, newEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate verification token
            const verificationTokenResult = tokenService_1.default.generateVerificationToken();
            const verificationExpires = verificationTokenResult.expires;
            // Update user with new email and verification token
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    email: newEmail,
                    isVerified: false,
                    verificationToken: verificationTokenResult.hashedToken,
                    verificationExpires
                }
            });
            return verificationTokenResult.token;
        });
    }
    // Send verification email
    sendVerificationEmail(user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield emailService_1.default.sendVerification(user, token);
        });
    }
    // Validate email change request
    validateEmailChangeRequest(newEmail, currentEmail) {
        const errors = [];
        if (!newEmail) {
            errors.push('New email is required');
            return { isValid: false, errors };
        }
        if (!this.validateEmailFormat(newEmail)) {
            errors.push('Invalid email format');
        }
        if (currentEmail === newEmail) {
            errors.push('New email must be different from current email');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Process email verification
    processEmailVerification(userId, newEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate and set verification token
            const token = yield this.updateUserEmail(userId, newEmail);
            // Get user data for email
            const user = yield this.getUserForVerification(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Send verification email
            yield this.sendVerificationEmail(user, token);
            logger_1.default.info(`Email reverification initiated for user ID: ${userId}, new email: ${newEmail}`);
            return true;
        });
    }
}
exports.default = new EmailVerificationService();
