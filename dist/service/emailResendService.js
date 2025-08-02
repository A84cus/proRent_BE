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
const authService_1 = __importDefault(require("./authService"));
const userRepository_1 = __importDefault(require("../repository/userRepository"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailResendService {
    // Resend verification email
    resendVerificationEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.isVerified) {
                throw new Error("User is already verified");
            }
            yield authService_1.default.resendVerificationEmail(email);
            logger_1.default.info(`Verification email resent to ${email}`);
            return "Verification email resent successfully";
        });
    }
    // Resend reset password email
    resendResetEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.socialLogin !== "NONE") {
                throw new Error("Password reset not available for social login accounts");
            }
            yield authService_1.default.requestPasswordReset(email);
            logger_1.default.info(`Reset email resent to ${email}`);
            return "Password reset email sent successfully";
        });
    }
    // Process resend email based on type
    processResendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, type } = options;
            switch (type) {
                case "verification":
                    return this.resendVerificationEmail(email);
                case "reset":
                    return this.resendResetEmail(email);
                default:
                    throw new Error("Invalid resend email type");
            }
        });
    }
}
exports.default = new EmailResendService();
