import emailService from "../email/emailService";
import { User } from "@prisma/client";
import { BookingDetails, UserWithProfile } from "../../interfaces";

class AuthNotificationService {
  // Send verification email
  async sendVerificationEmail(
    user: User,
    verificationToken: string
  ): Promise<void> {
    console.log(
      `DEBUG: Raw token being sent to ${user.email}: ${verificationToken}`
    );
    await emailService.sendVerification(user, verificationToken);
  }

  // Send password reset email
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    await emailService.sendResetPassword(user, resetToken);
  }

  // Send welcome email
  async sendWelcomeEmail(user: User): Promise<void> {
    await emailService.sendWelcome(user);
  }

  // Send booking confirmation email
  async sendBookingConfirmationEmail(
    user: UserWithProfile,
    bookingDetails: BookingDetails
  ): Promise<void> {
    await emailService.sendBookingConfirmation(user, bookingDetails);
  }
}

export default new AuthNotificationService();
