import UserAuthService from "../auth/userAuthService";
import AvatarUploadService from "../upload/avatarUploadService";
import EmailVerificationService from "../email/emailVerificationService";
import logger from "../../utils/system/logger";
class UserOperationsService {
  // Handle complete password change workflow
  async executePasswordChange(
    userId: string,
    currentPassword: string,
    newPassword: string,
    userPassword: string
  ): Promise<void> {
    const isCurrentPasswordValid = await UserAuthService.verifyCurrentPassword(
      currentPassword,
      userPassword
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    const passwordValidation = UserAuthService.validateNewPassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(", "));
    }
    const hashedNewPassword = await UserAuthService.hashNewPassword(
      newPassword
    );
    await UserAuthService.updateUserPassword(userId, hashedNewPassword);
  }
  // Handle complete avatar upload workflow
  async executeAvatarUpload(
    file: Express.Multer.File,
    userId: string
  ): Promise<any> {
    const cloudinaryResult = await AvatarUploadService.uploadToCloudinary(
      file,
      userId
    );
    const newPicture = await AvatarUploadService.savePicture(
      cloudinaryResult,
      userId,
      file.size
    );
    await AvatarUploadService.updateUserAvatar(userId, newPicture.id);
    logger.info(`Avatar uploaded for user ID: ${userId}`);
    return newPicture;
  }
  // Handle complete email reverification workflow
  async executeEmailReverification(
    userId: string,
    newEmail: string,
    currentEmail: string
  ): Promise<void> {
    const emailValidation = EmailVerificationService.validateEmailChangeRequest(
      newEmail,
      currentEmail
    );
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.errors[0]);
    }
    const isEmailAvailable =
      await EmailVerificationService.checkEmailAvailability(newEmail, userId);
    if (!isEmailAvailable) {
      throw new Error("Email is already taken");
    }
    await EmailVerificationService.processEmailVerification(userId, newEmail);
  }
}
export default new UserOperationsService();
