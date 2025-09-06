import { User, Profile } from "@prisma/client";
import {
  EmailOptions,
  BookingDetails,
  UserWithProfile,
} from "../../interfaces";
import {
  emailConfig,
  createEmailTransporter,
} from "../../config/third-party/email";
import {
  createVerificationEmailTemplate,
  createResetPasswordEmailTemplate,
  createWelcomeEmailTemplate,
  createBookingConfirmationTemplate,
} from "../../templates/email";
import logger from "../../utils/system/logger";
import DisposableEmailGenerator from "../../utils/disposableEmail";
import { THIRD_PARTY_CONFIG } from "../../config/environment";

class DisposableEmailService {
  private transporter;

  constructor() {
    this.transporter = createEmailTransporter();
  }

  // Override email destination dengan disposable email jika USE_DISPOSABLE=true
  private getEmailDestination(originalEmail: string): string {
    if (THIRD_PARTY_CONFIG.USE_DISPOSABLE === "true") {
      // Generate disposable email dan log untuk tracking
      const disposableEmail =
        DisposableEmailGenerator.generateDisposableMail("prorent");
      logger.info(`Email redirect: ${originalEmail} → ${disposableEmail}`);

      // Log ke console dengan instruksi
      DisposableEmailGenerator.logRedirect(originalEmail, disposableEmail);

      return disposableEmail;
    }
    return originalEmail;
  }

  // Send generic email dengan disposable support
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const destinationEmail = this.getEmailDestination(options.to);

      const mailOptions = {
        from: options.from || emailConfig.from,
        to: destinationEmail,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${destinationEmail}`);

      if (THIRD_PARTY_CONFIG.USE_DISPOSABLE === "true") {
        console.log(
          `✅ Email berhasil dikirim ke disposable email: ${destinationEmail}`
        );
      }
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw new Error("Failed to send email");
    }
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info("Email service connection verified successfully");
      return true;
    } catch (error) {
      logger.error("Email service connection failed:", error);
      return false;
    }
  }

  // Send verification email
  async sendVerification(user: User, token: string): Promise<void> {
    try {
      const verificationUrl = `${emailConfig.frontendUrl}/auth/verify-email?token=${token}`;
      const htmlContent = createVerificationEmailTemplate(
        user,
        verificationUrl
      );

      await this.sendEmail({
        to: user.email,
        subject: "Verify Your ProRent Account",
        html: htmlContent,
      });

      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  // Send password reset email
  async sendResetPassword(user: User, token: string): Promise<void> {
    try {
      const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${token}`;
      const htmlContent = createResetPasswordEmailTemplate(user, resetUrl);

      await this.sendEmail({
        to: user.email,
        subject: "Reset Your ProRent Password",
        html: htmlContent,
      });

      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  // Send welcome email
  async sendWelcome(user: User): Promise<void> {
    try {
      const dashboardUrl = `${emailConfig.frontendUrl}/dashboard`;
      const htmlContent = createWelcomeEmailTemplate(user, dashboardUrl);

      await this.sendEmail({
        to: user.email,
        subject: "Welcome to ProRent!",
        html: htmlContent,
      });

      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error("Failed to send welcome email:", error);
      throw new Error("Failed to send welcome email");
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(
    user: UserWithProfile,
    bookingDetails: BookingDetails
  ): Promise<void> {
    try {
      const htmlContent = createBookingConfirmationTemplate(
        user,
        bookingDetails
      );

      await this.sendEmail({
        to: user.email,
        subject: `Booking Confirmation - ${bookingDetails.propertyName}`,
        html: htmlContent,
      });

      logger.info(`Booking confirmation email sent to ${user.email}`);
    } catch (error) {
      logger.error("Failed to send booking confirmation email:", error);
      throw new Error("Failed to send booking confirmation email");
    }
  }

  // Method khusus untuk generate dan test disposable email
  async testDisposableEmail(): Promise<void> {
    try {
      console.log("🧪 Testing Disposable Email System...");

      // Generate disposable email
      const disposableEmail =
        DisposableEmailGenerator.generateDisposableMail("test");
      console.log(`📧 Generated: ${disposableEmail}`);

      // Test connection
      const isConnected = await this.testConnection();
      console.log(`🔗 Connection: ${isConnected ? "SUCCESS" : "FAILED"}`);

      if (!isConnected) {
        throw new Error("Email connection failed");
      }

      // Send test email
      await this.sendEmail({
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
      console.log(
        "1. Lihat log di atas untuk disposable email yang di-generate"
      );
      console.log("2. Buka https://www.disposablemail.com/");
      console.log("3. Masukkan email address yang di-generate");
      console.log("4. Cek inbox untuk email dari ProRent");
    } catch (error) {
      console.error("❌ Test disposable email failed:", error);
      throw error;
    }
  }
}

export default new DisposableEmailService();
