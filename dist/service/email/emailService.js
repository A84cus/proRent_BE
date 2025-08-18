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
const email_1 = require("../../config/third-party/email");
const email_2 = require("../../templates/email");
const logger_1 = __importDefault(require("../../utils/system/logger"));
class EmailService {
    constructor() {
        this.transporter = (0, email_1.createEmailTransporter)();
    }
    // Send generic email
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mailOptions = {
                    from: options.from || email_1.emailConfig.from,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                };
                yield this.transporter.sendMail(mailOptions);
                logger_1.default.info(`Email sent successfully to ${options.to}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send email:", error);
                throw new Error("Failed to send email");
            }
        });
    }
    // Send verification email
    sendVerification(user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verificationUrl = `${email_1.emailConfig.frontendUrl}/auth/verify-email?token=${token}`;
                const htmlContent = (0, email_2.createVerificationEmailTemplate)(user, verificationUrl);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Verify Your Email - ProRent",
                    html: htmlContent,
                });
                logger_1.default.info(`Verification email sent to ${user.email}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send verification email:", error);
                throw new Error("Failed to send verification email");
            }
        });
    }
    // Send password reset email
    sendResetPassword(user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resetUrl = `${email_1.emailConfig.frontendUrl}/auth/reset-password?token=${token}`;
                const htmlContent = (0, email_2.createResetPasswordEmailTemplate)(user, resetUrl);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Password Reset Request - ProRent",
                    html: htmlContent,
                });
                logger_1.default.info(`Password reset email sent to ${user.email}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send password reset email:", error);
                throw new Error("Failed to send password reset email");
            }
        });
    }
    // Send welcome email after verification
    sendWelcome(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboardUrl = user.role === "OWNER"
                    ? `${email_1.emailConfig.frontendUrl}/dashboard/owner`
                    : `${email_1.emailConfig.frontendUrl}/dashboard/user`;
                const htmlContent = (0, email_2.createWelcomeEmailTemplate)(user, dashboardUrl);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Welcome to ProRent - Your Account is Active!",
                    html: htmlContent,
                });
                logger_1.default.info(`Welcome email sent to ${user.email}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send welcome email:", error);
                // Don't throw error for welcome email as it's not critical
            }
        });
    }
    // Send booking confirmation email
    sendBookingConfirmation(user, // ✅ Now requires profile
    bookingDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const htmlContent = (0, email_2.createBookingConfirmationTemplate)(user, bookingDetails);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Booking Confirmation - ProRent",
                    html: htmlContent,
                });
                logger_1.default.info(`Booking confirmation email sent to ${user.email}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send booking confirmation email:", error);
                throw new Error("Failed to send booking confirmation email");
            }
        });
    }
    // Test email connection
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.verify();
                logger_1.default.info("Email service connection verified successfully");
                return true;
            }
            catch (error) {
                logger_1.default.error("Email service connection failed:", error);
                return false;
            }
        });
    }
}
exports.default = new EmailService();
