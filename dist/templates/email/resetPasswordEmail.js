"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResetPasswordEmailTemplate = void 0;
const createResetPasswordEmailTemplate = (user, resetUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - ProRent</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #c82333; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .security-note { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔒 ProRent</h1>
        <h2>Password Reset Request</h2>
      </div>
      <div class="content">
        <p>Hi there,</p>
        <p>We received a request to reset your password for your <strong>ProRent</strong> account.</p>
        <p>If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${resetUrl}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> This password reset link will expire in <strong>1 hour</strong>. 
          If the link expires, you can request another password reset from the login page.
        </div>
        
        <div class="security-note">
          <strong>🔐 Security Notice:</strong>
          <ul>
            <li>This link can only be used once</li>
            <li>Choose a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
            <li>Don't reuse passwords from other accounts</li>
          </ul>
        </div>
        
        <p><strong>If you didn't request this password reset:</strong></p>
        <ul>
          <li>Your account is still secure</li>
          <li>You can safely ignore this email</li>
          <li>Consider changing your password if you're concerned</li>
          <li>Contact our support team if you have questions</li>
        </ul>
        
        <p>Best regards,<br>The ProRent Team</p>
      </div>
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>If you need help, contact us at support@prorent.com</p>
        <p>&copy; 2025 ProRent. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
exports.createResetPasswordEmailTemplate = createResetPasswordEmailTemplate;
