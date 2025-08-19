import { User } from "@prisma/client";

export const createVerificationEmailTemplate = (
  user: User,
  verificationUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - ProRent</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #0056b3; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏠 ProRent</h1>
        <h2>Verify Your Email Address</h2>
      </div>
      <div class="content">
        <p>Hi there,</p>
        <p>Welcome to <strong>ProRent</strong>! We're excited to have you join our community of property owners and renters.</p>
        <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${verificationUrl}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> This verification link will expire in <strong>1 hour</strong>. 
          If the link expires, you can request a new verification email from the login page.
        </div>
        
        <p>After verification, you'll be able to:</p>
        <ul>
          <li>Access your dashboard</li>
          <li>Browse and book properties</li>
          <li>Manage your profile</li>
          <li>Connect with property owners</li>
        </ul>
        
        <p>If you didn't create an account with ProRent, please ignore this email.</p>
        
        <p>Best regards,<br>The ProRent Team</p>
      </div>
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; 2025 ProRent. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
