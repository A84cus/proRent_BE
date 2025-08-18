import { Request } from "express";
import UserProfileService from "../../service/user/userProfileService";
import UserAuthService from "../../service/auth/userAuthService";
import AvatarUploadService from "../../service/upload/avatarUploadService";
import EmailVerificationService from "../../service/email/emailVerificationService";
import {
  validateUserId,
  sanitizeInput,
  userProfileUpdateSchema,
  UserProfileUpdateInput,
} from "../../validations/user/userValidation";
import {
  UserValidationResult,
  ProfileUpdateData,
  UserPasswordChangeData,
  EmailChangeData,
} from "../../interfaces";

class UserControllerHelper {
  validateUserRequest(req: Request): UserValidationResult {
    return validateUserId(req);
  }

  async prepareProfileUpdateData(
    userId: string,
    requestBody: any
  ): Promise<ProfileUpdateData> {
    // Validate input using schema
    const validationResult = userProfileUpdateSchema.safeParse(requestBody);
    if (!validationResult.success) {
      throw new Error(validationResult.error.issues[0].message);
    }

    const sanitizedData = sanitizeInput(requestBody);
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
    const { newEmail } = sanitizeInput(requestBody);
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
