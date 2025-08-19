import authService from "../auth/authService";
import userRepository from "../../repository/user/userRepository";
import logger from "../../utils/system/logger";
import { ResendEmailOptions } from "../../interfaces";

class EmailResendService {
  // Resend verification email
  async resendVerificationEmail(email: string): Promise<string> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    await authService.resendVerificationEmail(email);
    logger.info(`Verification email resent to ${email}`);

    return "Verification email resent successfully";
  }

  // Resend reset password email
  async resendResetEmail(email: string): Promise<string> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.socialLogin !== "NONE") {
      throw new Error("Password reset not available for social login accounts");
    }

    await authService.requestPasswordReset(email);
    logger.info(`Reset email resent to ${email}`);

    return "Password reset email sent successfully";
  }

  // Process resend email based on type
  async processResendEmail(options: ResendEmailOptions): Promise<string> {
    const { email, type } = options;

    switch (type) {
      case "verification":
        return this.resendVerificationEmail(email);

      case "reset":
        return this.resendResetEmail(email);

      default:
        throw new Error("Invalid resend email type");
    }
  }
}

export default new EmailResendService();
