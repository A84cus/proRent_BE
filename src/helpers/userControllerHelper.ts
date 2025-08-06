import { Request } from "express";
import UserProfileService from "../service/userProfileService";
import UserAuthService from "../service/userAuthService";
import AvatarUploadService from "../service/avatarUploadService";
import EmailVerificationService from "../service/emailVerificationService";
import UserValidationHelper from "./userValidationHelper";
import {
  UserValidationResult,
  ProfileUpdateData,
  UserPasswordChangeData,
  EmailChangeData,
} from "../interfaces/userController.interface";

class UserControllerHelper {
  validateUserRequest(req: Request): UserValidationResult {
    const user = req.user as any;
    if (!user || !user.id) {
      return {
        isValid: false,
        error: "User not authenticated",
      };
    }
    return {
      isValid: true,
      userId: user.id,
    };
  }

  async prepareProfileUpdateData(
    userId: string,
    requestBody: any
  ): Promise<ProfileUpdateData> {
    const sanitizedData = UserValidationHelper.sanitizeInput(requestBody);
    const existingUser = await UserProfileService.checkUserExists(userId);
    return {
      sanitizedData,
      existingUser,
    };
  }

  validatePasswordRequest(currentPassword: string, newPassword: string): any {
    return UserAuthService.validatePasswordChangeRequest(
      currentPassword,
      newPassword
    );
  }

  async preparePasswordChangeData(
    userId: string,
    requestBody: any
  ): Promise<UserPasswordChangeData> {
    const { currentPassword, newPassword } = requestBody;
    const user = await UserAuthService.getUserWithPassword(userId);
    return {
      currentPassword,
      newPassword,
      user,
    };
  }

  validateAvatarFile(file: Express.Multer.File | undefined): any {
    return AvatarUploadService.validateFile(file);
  }

  isCloudinaryConfigValid(): boolean {
    return AvatarUploadService.validateCloudinaryConfig();
  }

  async prepareEmailChangeData(
    userId: string,
    requestBody: any
  ): Promise<EmailChangeData> {
    const { newEmail } = UserValidationHelper.sanitizeInput(requestBody);
    const user = await EmailVerificationService.getUserForVerification(userId);
    return {
      newEmail,
      user,
    };
  }

  formatAvatarResponse(picture: any) {
    return {
      avatar: {
        id: picture.id,
        url: picture.url,
        alt: picture.alt,
      },
    };
  }

  getProfileUpdateErrorConfig() {
    return {
      "Invalid birth date format": {
        message: "Invalid birth date format",
        statusCode: 400,
      },
    };
  }

  getCloudinaryConfigError() {
    return {
      configuration: {
        message:
          "Image upload service is not properly configured. Please contact administrator.",
        statusCode: 500,
      },
    };
  }

  formatAvatarUploadError(error: any): { message: string; statusCode: number } {
    const errorMessage = AvatarUploadService.handleCloudinaryError(error);
    const statusCode = errorMessage.includes("configuration") ? 500 : 400;
    return {
      message: errorMessage,
      statusCode,
    };
  }
}
export default new UserControllerHelper();
