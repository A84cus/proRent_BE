import { PrismaClient } from "@prisma/client";
import passwordService from "./passwordService";
import logger from "../utils/logger";

const prisma = new PrismaClient();

class UserAuthService {
  // Get user with password for authentication
  async getUserWithPassword(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });
  }

  // Validate password change request
  validatePasswordChangeRequest(currentPassword: string, newPassword: string) {
    const errors: string[] = [];

    if (!currentPassword || !newPassword) {
      errors.push("Current password and new password are required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Verify current password
  async verifyCurrentPassword(currentPassword: string, hashedPassword: string) {
    return await passwordService.verifyPassword(
      currentPassword,
      hashedPassword
    );
  }

  // Validate new password strength
  validateNewPassword(newPassword: string) {
    return passwordService.validatePasswordStrength(newPassword);
  }

  // Hash new password
  async hashNewPassword(newPassword: string) {
    return await passwordService.hashPassword(newPassword);
  }

  // Update user password
  async updateUserPassword(userId: string, hashedPassword: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user ID: ${userId}`);
  }
}

export default new UserAuthService();
