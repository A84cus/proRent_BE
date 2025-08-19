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
      const validatedData = verifyEmailSchema.parse(req.query);
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
}

export default new AuthController();
