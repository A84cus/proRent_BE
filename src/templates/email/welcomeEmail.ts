import { User } from "@prisma/client";

export const createWelcomeEmailTemplate = (
  user: User,
  dashboardUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ProRent!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #218838; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome to ProRent!</h1>
        <p>Your account is now verified and ready to use</p>
      </div>
      <div class="content">
        <p>Hi there,</p>
        <p>Congratulations! Your email has been successfully verified and your <strong>ProRent</strong> account is now active.</p>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>
        
        <div class="features">
          <h3>🚀 What you can do now:</h3>
          ${
            user.role === "OWNER"
              ? `
            <ul>
              <li><strong>List Properties:</strong> Add your properties and rooms for rent</li>
              <li><strong>Manage Bookings:</strong> Handle reservations and guest communications</li>
              <li><strong>Track Earnings:</strong> Monitor your rental income</li>
              <li><strong>Property Analytics:</strong> View performance insights</li>
            </ul>
          `
              : `
            <ul>
              <li><strong>Browse Properties:</strong> Explore available rentals in your area</li>
              <li><strong>Make Reservations:</strong> Book your perfect accommodation</li>
              <li><strong>Manage Bookings:</strong> Track your reservations and payments</li>
              <li><strong>Leave Reviews:</strong> Share your experience with others</li>
            </ul>
          `
          }
        </div>
        
        <p><strong>Need help getting started?</strong></p>
        <ul>
          <li>Check out our help center for tutorials</li>
          <li>Contact our support team anytime</li>
          <li>Join our community forum for tips and advice</li>
        </ul>
        
        <p>Thank you for choosing ProRent. We're here to make your ${
          user.role === "OWNER" ? "property rental" : "accommodation search"
        } experience amazing!</p>
        
        <p>Best regards,<br>The ProRent Team</p>
      </div>
      <div class="footer">
        <p>Questions? Email us at support@prorent.com</p>
        <p>&copy; 2025 ProRent. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
