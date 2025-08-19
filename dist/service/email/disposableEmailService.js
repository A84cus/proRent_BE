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
const disposableEmail_1 = __importDefault(require("../../utils/disposableEmail"));
const environment_1 = require("../../config/environment");
class DisposableEmailService {
    constructor() {
        this.transporter = (0, email_1.createEmailTransporter)();
    }
    // Override email destination dengan disposable email jika USE_DISPOSABLE=true
    getEmailDestination(originalEmail) {
        if (environment_1.THIRD_PARTY_CONFIG.USE_DISPOSABLE === "true") {
            // Generate disposable email dan log untuk tracking
            const disposableEmail = disposableEmail_1.default.generateDisposableMail("prorent");
            logger_1.default.info(`Email redirect: ${originalEmail} → ${disposableEmail}`);
            // Log ke console dengan instruksi
            disposableEmail_1.default.logRedirect(originalEmail, disposableEmail);
            return disposableEmail;
        }
        return originalEmail;
    }
    // Send generic email dengan disposable support
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const destinationEmail = this.getEmailDestination(options.to);
                const mailOptions = {
                    from: options.from || email_1.emailConfig.from,
                    to: destinationEmail,
                    subject: options.subject,
                    html: options.html,
                };
                yield this.transporter.sendMail(mailOptions);
                logger_1.default.info(`Email sent successfully to ${destinationEmail}`);
                if (environment_1.THIRD_PARTY_CONFIG.USE_DISPOSABLE === "true") {
                    console.log(`✅ Email berhasil dikirim ke disposable email: ${destinationEmail}`);
                }
            }
            catch (error) {
                logger_1.default.error("Failed to send email:", error);
                throw new Error("Failed to send email");
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
    // Send verification email
    sendVerification(user, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verificationUrl = `${email_1.emailConfig.frontendUrl}/auth/verify-email?token=${token}`;
                const htmlContent = (0, email_2.createVerificationEmailTemplate)(user, verificationUrl);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Verify Your ProRent Account",
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
                    subject: "Reset Your ProRent Password",
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
    // Send welcome email
    sendWelcome(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboardUrl = `${email_1.emailConfig.frontendUrl}/dashboard`;
                const htmlContent = (0, email_2.createWelcomeEmailTemplate)(user, dashboardUrl);
                yield this.sendEmail({
                    to: user.email,
                    subject: "Welcome to ProRent!",
                    html: htmlContent,
                });
                logger_1.default.info(`Welcome email sent to ${user.email}`);
            }
            catch (error) {
                logger_1.default.error("Failed to send welcome email:", error);
                throw new Error("Failed to send welcome email");
            }
        });
    }
    // Send booking confirmation email
    sendBookingConfirmation(user, bookingDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const htmlContent = (0, email_2.createBookingConfirmationTemplate)(user, bookingDetails);
                yield this.sendEmail({
                    to: user.email,
                    subject: `Booking Confirmation - ${bookingDetails.propertyName}`,
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
    // Method khusus untuk generate dan test disposable email
    testDisposableEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🧪 Testing Disposable Email System...");
                // Generate disposable email
                const disposableEmail = disposableEmail_1.default.generateDisposableMail("test");
                console.log(`📧 Generated: ${disposableEmail}`);
                // Test connection
                const isConnected = yield this.testConnection();
                console.log(`🔗 Connection: ${isConnected ? "SUCCESS" : "FAILED"}`);
                if (!isConnected) {
                    throw new Error("Email connection failed");
                }
                // Send test email
                yield this.sendEmail({
                    to: "test@example.com", // Akan di-redirect ke disposable
                    subject: "ProRent - Test Disposable Email",
                    html: `
          <h1>🎉 ProRent Test Email</h1>
          <p>Ini adalah test email menggunakan sistem disposable mail.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p><small>ProRent Email Service Test</small></p>
        `,
                });
                console.log("✅ Test email berhasil dikirim!");
                console.log("\n🎯 Instruksi selanjutnya:");
                console.log("1. Lihat log di atas untuk disposable email yang di-generate");
                console.log("2. Buka https://www.disposablemail.com/");
                console.log("3. Masukkan email address yang di-generate");
                console.log("4. Cek inbox untuk email dari ProRent");
            }
            catch (error) {
                console.error("❌ Test disposable email failed:", error);
                throw error;
            }
        });
    }
}
exports.default = new DisposableEmailService();
