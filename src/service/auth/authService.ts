import { User, Role, Prisma } from "@prisma/client";
import logger from "../../utils/system/logger";
import userRepository from "../../repository/user/userRepository";
import tokenService from "./tokenService";
import passwordService from "./passwordService";
import authNotificationService from "./authNotificationService";
import {
  LoginData,
  RegisterUserData,
  ResetPasswordData,
  ProviderLoginData,
  ProviderLoginResult,
} from "../../interfaces";

class AuthService {
  async registerUser(
    data: RegisterUserData
  ): Promise<{ user: User; requiresPassword: boolean }> {
    try {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      const { token, hashedToken, expires } =
        tokenService.generateVerificationToken();

      // Hash password if provided
      let hashedPassword;
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

  async verifyEmail(
    token: string,
    password?: string
  ): Promise<{
    success: boolean;
    message: string;
    requiresRedirect?: boolean;
  }> {
    try {
      const hashedToken = tokenService.hashToken(token);
      logger.info(`Looking for user with hashed token: ${hashedToken}`);

      const user = await userRepository.findByVerificationToken(hashedToken);

      if (!user) {
        logger.warn(`No user found with verification token: ${hashedToken}`);
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      logger.info(
        `Found user: ${user.email}, token expires: ${user.verificationExpires}`
      );

      // Prepare update data
      const updateData: any = { isVerified: true };

      // If password is provided, hash and set it
      if (password) {
        const hashedPassword = await passwordService.hashPassword(password);
        updateData.password = hashedPassword;
        logger.info(`Setting password for user: ${user.email}`);
      }

      // Mark user as verified and set password if provided
      await userRepository.update(user.id, updateData);
      await userRepository.clearVerificationToken(user.id);
      await authNotificationService.sendWelcomeEmail(user);

      return {
        success: true,
        message: password
          ? "Email verified and password created successfully"
          : "Email verified successfully",
        requiresRedirect: !!password, // If password was set, redirect to login
      };
    } catch (error) {
      logger.error("Email verification error:", error);
      throw error;
    }
  }

  async validateVerificationToken(
    token: string
  ): Promise<{ valid: boolean; message: string; userEmail?: string }> {
    try {
      const hashedToken = tokenService.hashToken(token);
      const user = await userRepository.findByVerificationToken(hashedToken);

      if (!user) {
        return {
          valid: false,
          message: "Invalid or expired verification token",
        };
      }

      return {
        valid: true,
        message: "Token is valid",
        userEmail: user.email,
      };
    } catch (error) {
      logger.error("Token validation error:", error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.isVerified) {
        throw new Error("User is already verified");
      }

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
      if (!user) {
        throw new Error("Invalid credentials");
      }

      if (data.socialLogin && data.socialLogin !== "NONE") {
        if (user.socialLogin !== data.socialLogin) {
          throw new Error("Invalid social login method");
        }
      } else {
        if (!user.password) {
          throw new Error(
            "Password not set. Please use social login or set a password."
          );
        }
        if (!data.password) {
          throw new Error("Password is required");
        }
        const isPasswordValid = await passwordService.verifyPassword(
          data.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
      }

      if (!user.isVerified) {
        throw new Error("Please verify your email before logging in");
      }

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

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

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

  async loginWithProvider(
    data: ProviderLoginData
  ): Promise<ProviderLoginResult> {
    try {
      // Check if user already exists
      let user = await userRepository.findByEmail(data.email, {
        profile: true,
      });
      let isNewUser = false;

      if (!user) {
        // Register new user
        isNewUser = true;
        const socialLoginType =
          data.providerId === "google.com" ? "GOOGLE" : "NONE";

        user = await userRepository.create({
          email: data.email,
          role: data.role || "USER",
          socialLogin: socialLoginType,
          isVerified: data.emailVerified, // Trust provider verification
          profile: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
          },
        });

        logger.info(`New user registered via provider: ${data.email}`);
      } else {
        // Update existing user with provider info if needed
        const updates: Prisma.UserUpdateInput = {};

        if (data.providerId === "google.com" && user.socialLogin !== "GOOGLE") {
          updates.socialLogin = "GOOGLE";
        }

        if (data.emailVerified && !user.isVerified) {
          updates.isVerified = true;
        }

        // Check if user has profile (using type assertion since we know we included it)
        const userWithProfile = user as any;

        // Update profile if it doesn't exist or lacks provider info
        if (!userWithProfile.profile) {
          updates.profile = {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
          };
        } else if (!userWithProfile.profile.firstName && data.firstName) {
          updates.profile = {
            update: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
          };
        }

        if (Object.keys(updates).length > 0) {
          await userRepository.update(user.id, updates);
          // Refresh user data
          user = await userRepository.findByEmail(data.email, {
            profile: true,
          });
        }

        logger.info(`Existing user logged in via provider: ${data.email}`);
      }

      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      // Generate JWT token
      const token = tokenService.generateJWTToken(user.id, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          socialLogin: user.socialLogin,
        },
        token,
        isNewUser,
      };
    } catch (error) {
      logger.error("Provider login error:", error);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<{
    exists: boolean;
    isVerified?: boolean;
    socialLogin?: string;
  }> {
    try {
      const user = await userRepository.findByEmail(email);

      if (!user) {
        return {
          exists: false,
        };
      }

      return {
        exists: true,
        isVerified: user.isVerified,
        socialLogin: user.socialLogin,
      };
    } catch (error) {
      logger.error("Check email error:", error);
      throw error;
    }
  }
}

export default new AuthService();
