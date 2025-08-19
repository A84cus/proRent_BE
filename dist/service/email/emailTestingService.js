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
const logger_1 = __importDefault(require("../../utils/system/logger"));
class EmailTestingService {
    // Test verification email
    testVerificationEmail(to) {
        return __awaiter(this, void 0, void 0, function* () {
            const mockUser = this.createMockUser(to, false);
            const mockToken = "test-verification-token-123";
            yield emailService_1.default.sendVerification(mockUser, mockToken);
            logger_1.default.info(`Test verification email sent to ${to}`);
            return "Verification email sent successfully";
        });
    }
    // Test reset password email
    testResetEmail(to) {
        return __awaiter(this, void 0, void 0, function* () {
            const mockUser = this.createMockUser(to, true);
            const mockResetToken = "test-reset-token-456";
            yield emailService_1.default.sendResetPassword(mockUser, mockResetToken);
            logger_1.default.info(`Test reset email sent to ${to}`);
            return "Reset password email sent successfully";
        });
    }
    // Test welcome email
    testWelcomeEmail(to) {
        return __awaiter(this, void 0, void 0, function* () {
            const mockUser = this.createMockUser(to, true);
            yield emailService_1.default.sendWelcome(mockUser);
            logger_1.default.info(`Test welcome email sent to ${to}`);
            return "Welcome email sent successfully";
        });
    }
    // Test custom email
    testCustomEmail(to, subject, customHtml) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!customHtml) {
                throw new Error("customHtml is required for custom email type");
            }
            yield emailService_1.default.sendEmail({
                to,
                subject,
                html: customHtml,
            });
            logger_1.default.info(`Test custom email sent to ${to}`);
            return "Custom email sent successfully";
        });
    }
    // Process test email based on type
    processTestEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, subject, type, customHtml } = options;
            switch (type) {
                case "verification":
                    return this.testVerificationEmail(to);
                case "reset":
                    return this.testResetEmail(to);
                case "welcome":
                    return this.testWelcomeEmail(to);
                case "custom":
                    return this.testCustomEmail(to, subject, customHtml);
                default:
                    throw new Error("Invalid email test type");
            }
        });
    }
    // Helper method to create mock user
    createMockUser(email, isVerified) {
        return {
            id: "test-user-id",
            email,
            role: "USER",
            password: isVerified ? "hashed-password" : null,
            isVerified,
            socialLogin: "NONE",
            verificationToken: null,
            verificationExpires: null,
            resetToken: null,
            resetExpires: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
exports.default = new EmailTestingService();
