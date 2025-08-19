import { PrismaClient, User } from "@prisma/client";
import emailService from "./emailService";
import tokenService from "../auth/tokenService";
import logger from "../../utils/system/logger";

const prisma = new PrismaClient();

class EmailVerificationService {
  // Validate email format
  validateEmailFormat(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if email is already taken
  async checkEmailAvailability(email: string, currentUserId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    return !existingUser || existingUser.id === currentUserId;
  }

  // Get user for email verification
  async getUserForVerification(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  // Update user email and set verification token
  async updateUserEmail(userId: string, newEmail: string) {
    // Generate verification token
    const verificationTokenResult = tokenService.generateVerificationToken();
    const verificationExpires = verificationTokenResult.expires;

    // Update user with new email and verification token
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        isVerified: false,
        verificationToken: verificationTokenResult.hashedToken,
        verificationExpires,
      },
    });

    return verificationTokenResult.token;
  }

  // Send verification email
  async sendVerificationEmail(user: User, token: string) {
    await emailService.sendVerification(user, token);
  }

  // Validate email change request
  validateEmailChangeRequest(newEmail: string, currentEmail: string) {
    const errors: string[] = [];

    if (!newEmail) {
      errors.push("New email is required");
      return { isValid: false, errors };
    }

    if (!this.validateEmailFormat(newEmail)) {
      errors.push("Invalid email format");
    }

    if (currentEmail === newEmail) {
      errors.push("New email must be different from current email");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Process email verification
  async processEmailVerification(userId: string, newEmail: string) {
    // Generate and set verification token
    const token = await this.updateUserEmail(userId, newEmail);

    // Get user data for email
    const user = await this.getUserForVerification(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Send verification email
    await this.sendVerificationEmail(user, token);

    logger.info(
      `Email reverification initiated for user ID: ${userId}, new email: ${newEmail}`
    );

    return true;
  }
}

export default new EmailVerificationService();
