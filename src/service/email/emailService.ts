import { User, Profile } from '@prisma/client';
import { EmailOptions, BookingDetails, UserWithProfile } from '../../interfaces';
import { emailConfig, createEmailTransporter } from '../../config/third-party/email';
import {
   createVerificationEmailTemplate,
   createResetPasswordEmailTemplate,
   createWelcomeEmailTemplate,
   createBookingConfirmationTemplate,
   createBookingReminderTemplate
} from '../../templates/email';
import logger from '../../utils/system/logger';

class EmailService {
   private transporter;

   constructor () {
      this.transporter = createEmailTransporter();
   }

   // Send generic email
   async sendEmail (options: EmailOptions): Promise<void> {
      try {
         const mailOptions = {
            from: options.from || emailConfig.from,
            to: options.to,
            subject: options.subject,
            html: options.html
         };

         await this.transporter.sendMail(mailOptions);
         logger.info(`Email sent successfully to ${options.to}`);
      } catch (error) {
         logger.error('Failed to send email:', error);
         throw new Error('Failed to send email');
      }
   }

   // Send verification email
   async sendVerification (user: User, token: string): Promise<void> {
      try {
         const verificationUrl = `${emailConfig.frontendUrl}/auth/verify-email?token=${token}`;
         const htmlContent = createVerificationEmailTemplate(user, verificationUrl);

         await this.sendEmail({
            to: user.email,
            subject: 'Verify Your Email - ProRent',
            html: htmlContent
         });

         logger.info(`Verification email sent to ${user.email}`);
      } catch (error) {
         logger.error('Failed to send verification email:', error);
         throw new Error('Failed to send verification email');
      }
   }

   // Send password reset email
   async sendResetPassword (user: User, token: string): Promise<void> {
      try {
         const resetUrl = `${emailConfig.frontendUrl}/auth/reset-password?token=${token}`;
         const htmlContent = createResetPasswordEmailTemplate(user, resetUrl);

         await this.sendEmail({
            to: user.email,
            subject: 'Password Reset Request - ProRent',
            html: htmlContent
         });

         logger.info(`Password reset email sent to ${user.email}`);
      } catch (error) {
         logger.error('Failed to send password reset email:', error);
         throw new Error('Failed to send password reset email');
      }
   }

   // Send welcome email after verification
   async sendWelcome (user: User): Promise<void> {
      try {
         const dashboardUrl =
            user.role === 'OWNER'
               ? `${emailConfig.frontendUrl}/dashboard/owner`
               : `${emailConfig.frontendUrl}/dashboard/user`;

         const htmlContent = createWelcomeEmailTemplate(user, dashboardUrl);

         await this.sendEmail({
            to: user.email,
            subject: 'Welcome to ProRent - Your Account is Active!',
            html: htmlContent
         });

         logger.info(`Welcome email sent to ${user.email}`);
      } catch (error) {
         logger.error('Failed to send welcome email:', error);
         // Don't throw error for welcome email as it's not critical
      }
   }

   // Send booking confirmation email
   async sendBookingConfirmation (
      user: UserWithProfile, // ✅ Now requires profile
      bookingDetails: BookingDetails
   ): Promise<void> {
      try {
         const htmlContent = createBookingConfirmationTemplate(user, bookingDetails);

         await this.sendEmail({
            to: user.email,
            subject: 'Booking Confirmation - ProRent',
            html: htmlContent
         });

         logger.info(`Booking confirmation email sent to ${user.email}`);
      } catch (error) {
         logger.error('Failed to send booking confirmation email:', error);
         throw new Error('Failed to send booking confirmation email');
      }
   }
   async sendBookingReminder (user: UserWithProfile, bookingDetails: BookingDetails): Promise<void> {
      try {
         const htmlContent = createBookingReminderTemplate(user, bookingDetails);

         await this.sendEmail({
            to: user.email,
            subject: 'Reminder: Your Stay is Tomorrow - ProRent', // Fixed subject
            html: htmlContent
         });

         logger.info(`Booking reminder email sent to ${user.email}`);
      } catch (error) {
         logger.error('Failed to send booking reminder email:', error);
         throw new Error('Failed to send booking reminder email');
      }
   }
   // Test email connection
   async testConnection (): Promise<boolean> {
      try {
         await this.transporter.verify();
         logger.info('Email service connection verified successfully');
         return true;
      } catch (error) {
         logger.error('Email service connection failed:', error);
         return false;
      }
   }
}

export default new EmailService();
