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
const emailService_1 = __importDefault(require("../email/emailService"));
class AuthNotificationService {
    // Send verification email
    sendVerificationEmail(user, verificationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`DEBUG: Raw token being sent to ${user.email}: ${verificationToken}`);
            yield emailService_1.default.sendVerification(user, verificationToken);
        });
    }
    // Send password reset email
    sendPasswordResetEmail(user, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield emailService_1.default.sendResetPassword(user, resetToken);
        });
    }
    // Send welcome email
    sendWelcomeEmail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield emailService_1.default.sendWelcome(user);
        });
    }
    // Send booking confirmation email
    sendBookingConfirmationEmail(user, bookingDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            yield emailService_1.default.sendBookingConfirmation(user, bookingDetails);
        });
    }
}
exports.default = new AuthNotificationService();
