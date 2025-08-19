import emailService from "./emailService";
import { User } from "@prisma/client";
import logger from "../../utils/system/logger";
import { TestEmailOptions } from "../../interfaces";

class EmailTestingService {
  // Test verification email
  async testVerificationEmail(to: string): Promise<string> {
    const mockUser = this.createMockUser(to, false);
    const mockToken = "test-verification-token-123";

    await emailService.sendVerification(mockUser, mockToken);
    logger.info(`Test verification email sent to ${to}`);

    return "Verification email sent successfully";
  }

  // Test reset password email
  async testResetEmail(to: string): Promise<string> {
    const mockUser = this.createMockUser(to, true);
    const mockResetToken = "test-reset-token-456";

    await emailService.sendResetPassword(mockUser, mockResetToken);
    logger.info(`Test reset email sent to ${to}`);

    return "Reset password email sent successfully";
  }

  // Test welcome email
  async testWelcomeEmail(to: string): Promise<string> {
    const mockUser = this.createMockUser(to, true);

    await emailService.sendWelcome(mockUser);
    logger.info(`Test welcome email sent to ${to}`);

    return "Welcome email sent successfully";
  }

  // Test custom email
  async testCustomEmail(
    to: string,
    subject: string,
    customHtml: string
  ): Promise<string> {
    if (!customHtml) {
      throw new Error("customHtml is required for custom email type");
    }

    await emailService.sendEmail({
      to,
      subject,
      html: customHtml,
    });

    logger.info(`Test custom email sent to ${to}`);
    return "Custom email sent successfully";
  }

  // Process test email based on type
  async processTestEmail(options: TestEmailOptions): Promise<string> {
    const { to, subject, type, customHtml } = options;

    switch (type) {
      case "verification":
        return this.testVerificationEmail(to);

      case "reset":
        return this.testResetEmail(to);

      case "welcome":
        return this.testWelcomeEmail(to);

      case "custom":
        return this.testCustomEmail(to, subject, customHtml!);

      default:
        throw new Error("Invalid email test type");
    }
  }

  // Helper method to create mock user
  private createMockUser(email: string, isVerified: boolean): User {
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

export default new EmailTestingService();
