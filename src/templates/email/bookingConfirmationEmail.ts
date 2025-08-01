import { User } from "@prisma/client";

export const createBookingConfirmationTemplate = (
  user: User,
  bookingDetails: any
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ProRent</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #17a2b8; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Booking Confirmed!</h1>
        <p>Your reservation is confirmed</p>
      </div>
      <div class="content">
        <p>Hi ${user.email},</p>
        <p>Great news! Your booking has been confirmed.</p>
        
        <div class="booking-details">
          <h3>📋 Booking Details:</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.id || "N/A"}</p>
          <p><strong>Property:</strong> ${
            bookingDetails.propertyName || "N/A"
          }</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn || "N/A"}</p>
          <p><strong>Check-out:</strong> ${bookingDetails.checkOut || "N/A"}</p>
          <p><strong>Total Amount:</strong> ${
            bookingDetails.totalAmount || "N/A"
          }</p>
        </div>
        
        <p>We'll send you additional details as your check-in date approaches.</p>
        
        <p>Best regards,<br>The ProRent Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 ProRent. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
