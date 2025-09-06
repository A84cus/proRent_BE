import { Request, Response } from "express";
import authService from "../../service/auth/authService";
import logger from "../../utils/system/logger";
import {
  handleError,
  handleAuthError,
} from "../../helpers/system/errorHandler";
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "../../constants/controllers/auth";
import {
  registerUserSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  loginWithProviderSchema,
  checkEmailSchema,
} from "../../validations";

class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const result = await authService.registerUser(validatedData);

      logger.info(
        `User registration initiated for email: ${validatedData.email}`
      );

      res.status(201).json({
        success: true,
        message: AUTH_SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        data: {
          userId: result.user.id,
          email: result.user.email,
          role: result.user.role,
          requiresPassword: result.requiresPassword,
          isVerified: result.user.isVerified,
        },
      });
    } catch (error) {
      handleError(res, error, "User registration");
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      // Support both GET (query params) and POST (body) requests
      const isGetRequest = req.method === "GET";
      const dataSource = isGetRequest ? req.query : req.body;

      const validatedData = verifyEmailSchema.parse(dataSource);
      const result = await authService.verifyEmail(validatedData.token);

      if (result.success) {
        logger.info("Email verification successful");
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      handleError(res, error, "Email verification");
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const validatedData = resendVerificationSchema.parse(req.body);
      await authService.resendVerificationEmail(validatedData.email);

      logger.info(`Verification email resent to: ${validatedData.email}`);
      res.status(200).json({
        success: true,
        message: AUTH_SUCCESS_MESSAGES.VERIFICATION_EMAIL_SENT,
      });
    } catch (error) {
      handleError(res, error, "Resend verification");
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.loginUser(validatedData);

      logger.info(`User logged in: ${validatedData.email}`);

      const redirectUrl =
        result.user.role === "OWNER" ? "/dashboard/owner" : "/dashboard/user";

      res.status(200).json({
        success: true,
        message: AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            isVerified: result.user.isVerified,
          },
          token: result.token,
          redirectUrl,
        },
      });
    } catch (error) {
      handleAuthError(res, error, "Login");
    }
  }

  async resetPasswordRequest(req: Request, res: Response) {
    try {
      const validatedData = resetPasswordRequestSchema.parse(req.body);
      await authService.requestPasswordReset(validatedData.email);

      logger.info(`Password reset requested for: ${validatedData.email}`);
      res.status(200).json({
        success: true,
        message: AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      });
    } catch (error) {
      handleError(res, error, "Password reset request");
    }
  }

  async resetPasswordConfirm(req: Request, res: Response) {
    try {
      const validatedData = resetPasswordConfirmSchema.parse(req.body);
      await authService.confirmPasswordReset(validatedData);

      logger.info("Password reset completed successfully");
      res.status(200).json({
        success: true,
        message: AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleError(res, error, "Password reset confirm");
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: AUTH_ERROR_MESSAGES.UNAUTHORIZED });
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          socialLogin: user.socialLogin,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      handleError(res, error, "Get current user");
    }
  }

  /**
   * Login or register user using OAuth provider (Google, etc.)
   *
   * Expected request body:
   * {
   *   "email": "user@example.com",
   *   "emailVerified": true,
   *   "providerId": "google.com",
   *   "federatedId": "https://accounts.google.com/115638852868856441323",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "fullName": "John Doe",
   *   "displayName": "John Doe",
   *   "photoUrl": "https://example.com/photo.jpg",
   *   "idToken": "eyJhbGciOiJSUzI1NiIs...",
   *   "role": "USER" // optional, defaults to USER
   * }
   *
   * Response:
   * - If new user: Creates account and profile, returns user data and JWT token
   * - If existing user: Updates profile if needed, returns user data and JWT token
   */
  async loginWithProvider(req: Request, res: Response) {
    try {
      const validatedData = loginWithProviderSchema.parse(req.body);

      // Check if email is verified from the provider
      if (!validatedData.emailVerified) {
        return res.status(400).json({
          success: false,
          message: "Email not verified by provider",
        });
      }

      const result = await authService.loginWithProvider(validatedData);

      logger.info(
        `Provider login ${
          result.isNewUser ? "registered and logged in" : "logged in"
        } for email: ${validatedData.email}`
      );

      res.status(200).json({
        success: true,
        message: result.isNewUser
          ? AUTH_SUCCESS_MESSAGES.REGISTRATION_SUCCESS
          : AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          userId: result.user.id,
          email: result.user.email,
          role: result.user.role,
          isVerified: result.user.isVerified,
          socialLogin: result.user.socialLogin,
          isNewUser: result.isNewUser,
        },
        token: result.token,
      });
    } catch (error) {
      handleAuthError(res, error, "Provider login");
    }
  }

  async checkEmail(req: Request, res: Response) {
    try {
      const validatedData = checkEmailSchema.parse(req.body);
      const result = await authService.checkEmailExists(validatedData.email);

      logger.info(`Email check performed for: ${validatedData.email}`);

      res.status(200).json({
        success: true,
        message: "Email check completed",
        data: {
          email: validatedData.email,
          exists: result.exists,
          isVerified: result.isVerified,
          socialLogin: result.socialLogin,
        },
      });
    } catch (error) {
      handleError(res, error, "Email check");
    }
  }
}

export default new AuthController();
