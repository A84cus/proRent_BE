import { Request, Response } from "express";
import logger from "../utils/logger";
import UserProfileService from "../service/userProfileService";
import UserOperationsService from "../service/userOperationsService";
import UserControllerHelper from "../helpers/userControllerHelper";
import BaseController from "./BaseController";
class UserController extends BaseController {
  async getProfile(req: Request, res: Response) {
    try {
      const userValidation = UserControllerHelper.validateUserRequest(req);
      if (!userValidation.isValid) {
        return this.handleAuthError(res, userValidation.error!);
      }
      const user = await UserProfileService.getUserProfile(
        userValidation.userId!
      );
      if (!user) {
        return this.handleNotFoundError(res, "User");
      }
      const profileData = UserProfileService.formatProfileData(user);
      logger.info(`User profile accessed by user ID: ${userValidation.userId}`);
      return this.handleSuccess(
        res,
        "Profile retrieved successfully",
        profileData
      );
    } catch (error) {
      return this.handleError(res, error, "getting user profile");
    }
  }
  async updateProfile(req: Request, res: Response) {
    try {
      const userValidation = UserControllerHelper.validateUserRequest(req);
      if (!userValidation.isValid) {
        return this.handleAuthError(res, userValidation.error!);
      }
      const { sanitizedData, existingUser } =
        await UserControllerHelper.prepareProfileUpdateData(
          userValidation.userId!,
          req.body
        );
      if (!existingUser) {
        return this.handleNotFoundError(res, "User");
      }
      const updatedProfile = await UserProfileService.updateUserProfile(
        userValidation.userId!,
        sanitizedData
      );
      return this.handleSuccess(
        res,
        "Profile updated successfully",
        updatedProfile
      );
    } catch (error) {
      const specificErrors = UserControllerHelper.getProfileUpdateErrorConfig();
      return this.handleError(
        res,
        error,
        "updating user profile",
        specificErrors
      );
    }
  }
  async changePassword(req: Request, res: Response) {
    try {
      const userValidation = UserControllerHelper.validateUserRequest(req);
      if (!userValidation.isValid) {
        return this.handleAuthError(res, userValidation.error!);
      }
      const validation = UserControllerHelper.validatePasswordRequest(
        req.body.currentPassword,
        req.body.newPassword
      );
      if (!validation.isValid) {
        return this.handleValidationError(res, validation.errors[0]);
      }
      return await this.processPasswordChange(req, res, userValidation.userId!);
    } catch (error) {
      return this.handleError(res, error, "changing password");
    }
  }
  private async processPasswordChange(
    req: Request,
    res: Response,
    userId: string
  ) {
    const { currentPassword, newPassword, user } =
      await UserControllerHelper.preparePasswordChangeData(userId, req.body);
    if (!user || !user.password) {
      return this.handleNotFoundError(res, "User");
    }
    await UserOperationsService.executePasswordChange(
      userId,
      currentPassword,
      newPassword,
      user.password
    );
    return this.handleSuccess(res, "Password changed successfully");
  }
  async uploadAvatar(req: Request, res: Response) {
    try {
      const userValidation = UserControllerHelper.validateUserRequest(req);
      if (!userValidation.isValid) {
        return this.handleAuthError(res, userValidation.error!);
      }
      const fileValidation = UserControllerHelper.validateAvatarFile(req.file);
      if (!fileValidation.isValid) {
        return this.handleValidationError(res, fileValidation.errors[0]);
      }
      if (!UserControllerHelper.isCloudinaryConfigValid()) {
        const configError = UserControllerHelper.getCloudinaryConfigError();
        return this.handleError(
          res,
          new Error("configuration"),
          "uploading avatar",
          configError
        );
      }
      return await this.processAvatarUpload(req, res, userValidation.userId!);
    } catch (error: any) {
      return this.handleAvatarUploadError(res, error);
    }
  }
  private async processAvatarUpload(
    req: Request,
    res: Response,
    userId: string
  ) {
    const newPicture = await UserOperationsService.executeAvatarUpload(
      req.file!,
      userId
    );
    const avatarResponse =
      UserControllerHelper.formatAvatarResponse(newPicture);
    return this.handleSuccess(
      res,
      "Avatar uploaded successfully",
      avatarResponse
    );
  }
  private handleAvatarUploadError(res: Response, error: any) {
    const { message, statusCode } =
      UserControllerHelper.formatAvatarUploadError(error);
    return this.handleError(res, { message }, "uploading avatar", {
      [message]: { message, statusCode },
    });
  }
  async reverifyEmail(req: Request, res: Response) {
    try {
      const userValidation = UserControllerHelper.validateUserRequest(req);
      if (!userValidation.isValid) {
        return this.handleAuthError(res, userValidation.error!);
      }
      const { newEmail, user } =
        await UserControllerHelper.prepareEmailChangeData(
          userValidation.userId!,
          req.body
        );
      if (!user) {
        return this.handleNotFoundError(res, "User");
      }
      await UserOperationsService.executeEmailReverification(
        userValidation.userId!,
        newEmail,
        user.email
      );
      return this.handleSuccess(
        res,
        "Verification email sent to new email address. Please check your email to verify your new address."
      );
    } catch (error) {
      return this.handleError(res, error, "reverifying email");
    }
  }
}
export default new UserController();
