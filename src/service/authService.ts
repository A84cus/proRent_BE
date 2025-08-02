import { User } from "@prisma/client";
import logger from "../utils/logger";
import userRepository from "../repository/userRepository";
import tokenService from "./tokenService";
import passwordService from "./passwordService";
import authNotificationService from "./authNotificationService";
import {
  LoginData,
  RegisterUserData,
  ResetPasswordData,
  Role,
} from "../interfaces/auth.interface";

class AuthService {
  async registerUser(
    data: RegisterUserData
  ): Promise<{ user: User; requiresPassword: boolean }> {
    try {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) throw new Error("User already exists with this email");

      const { token, hashedToken, expires } =
        tokenService.generateVerificationToken();

      // Hash password if provided
      let hashedPassword = undefined;
      if (data.password) {
        hashedPassword = await passwordService.hashPassword(data.password);
      }

      const user = await userRepository.create({
        email: data.email,
        role: data.role,
        password: hashedPassword,
        socialLogin: data.socialLogin || "NONE",
        verificationToken: hashedToken,
        verificationExpires: expires,
        isVerified: false,
      });

      await authNotificationService.sendVerificationEmail(user, token);
      const requiresPassword = !data.socialLogin || data.socialLogin === "NONE";
      return { user, requiresPassword };
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }

  async registerTenant(email: string): Promise<User> {
    return this.registerUser({ email, role: "TENANT" }).then(
      (result) => result.user
    );
  }
  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const hashedToken = tokenService.hashToken(token);
      const user = await userRepository.findByVerificationToken(hashedToken);

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      // Mark user as verified
      await userRepository.update(user.id, { isVerified: true });
      await userRepository.clearVerificationToken(user.id);
      await authNotificationService.sendWelcomeEmail(user);
      return { success: true, message: "Email verified successfully" };
    } catch (error) {
      logger.error("Email verification error:", error);
      throw error;
    }
  }
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) throw new Error("User not found");
      if (user.isVerified) throw new Error("User is already verified");

      const { token, hashedToken, expires } =
        tokenService.generateVerificationToken();
      await userRepository.setVerificationToken(user.id, hashedToken, expires);
      await authNotificationService.sendVerificationEmail(user, token);
    } catch (error) {
      logger.error("Resend verification error:", error);
      throw error;
    }
  }
  async loginUser(data: LoginData): Promise<{ user: User; token: string }> {
    try {
      const user = await userRepository.findByEmail(data.email, {
        profile: true,
      });
      if (!user) throw new Error("Invalid credentials");

      if (data.socialLogin && data.socialLogin !== "NONE") {
        if (user.socialLogin !== data.socialLogin)
          throw new Error("Invalid social login method");
      } else {
        if (!user.password) {
          throw new Error(
            "Password not set. Please use social login or set a password."
          );
        }
        if (!data.password) throw new Error("Password is required");
        const isPasswordValid = await passwordService.verifyPassword(
          data.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid credentials");
      }

      if (!user.isVerified)
        throw new Error("Please verify your email before logging in");

      const token = tokenService.generateJWTToken(user.id, user.role);
      return { user, token };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        logger.info(
          `Password reset requested for non-existent email: ${email}`
        );
        return;
      }

      if (user.socialLogin !== "NONE") {
        throw new Error(
          "Password reset not available for social login accounts"
        );
      }

      const { token, hashedToken, expires } =
        tokenService.generateVerificationToken();
      await userRepository.setResetToken(user.id, hashedToken, expires);
      await authNotificationService.sendPasswordResetEmail(user, token);
    } catch (error) {
      logger.error("Password reset request error:", error);
      throw error;
    }
  }
  async confirmPasswordReset(data: ResetPasswordData): Promise<void> {
    try {
      const hashedToken = tokenService.hashToken(data.token);
      const user = await userRepository.findByResetToken(hashedToken);

      if (!user) throw new Error("Invalid or expired reset token");

      const hashedPassword = await passwordService.hashPassword(
        data.newPassword
      );
      await userRepository.updatePassword(user.id, hashedPassword);
      await userRepository.clearResetToken(user.id);
    } catch (error) {
      logger.error("Password reset confirmation error:", error);
      throw error;
    }
  }
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await userRepository.findById(userId, {
        profile: {
          include: {
            avatar: true,
            location: {
              include: {
                city: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error("Get user error:", error);
      throw error;
    }
  }

  verifyToken(token: string): { userId: string; role: Role } {
    return tokenService.verifyJWTToken(token);
  }
}

export default new AuthService();
