"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingReminderTemplate = void 0;
const config_1 = require("../../config");
const createBookingReminderTemplate = (User, bookingDetails) => {
    var _a, _b, _c, _d;
    const firstName = ((_a = User.profile) === null || _a === void 0 ? void 0 : _a.firstName) || ((_b = User.profile) === null || _b === void 0 ? void 0 : _b.lastName) || 'Valued Guest';
    const fullName = ((_c = User.profile) === null || _c === void 0 ? void 0 : _c.firstName) && ((_d = User.profile) === null || _d === void 0 ? void 0 : _d.lastName)
        ? `${User.profile.firstName} ${User.profile.lastName}`
        : firstName;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Reminder - ProRent</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f4f7f9;
        }
        .header { 
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
          border-radius: 0 0 10px 10px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .booking-details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #ffc107;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #6c757d; 
          font-size: 14px; 
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin-top: 20px;
          background-color: #ffc107;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background-color: ${bookingDetails.paymentStatus === 'CONFIRMED'
        ? '#d4edda'
        : bookingDetails.paymentStatus === 'PENDING_PAYMENT'
            ? '#fff3cd'
            : '#f8d7da'};
          color: ${bookingDetails.paymentStatus === 'CONFIRMED'
        ? '#155724'
        : bookingDetails.paymentStatus === 'PENDING_PAYMENT'
            ? '#856404'
            : '#721c24'};
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${config_1.LOGO_URL}" alt="ProRent Logo" width="100" style="display: block; max-width: 100px; width: 100px; height: auto; margin: 0 auto 15px auto;">
        <h1>Reminder: Your Stay is Tomorrow!</h1>
        <p>We can't wait to see you at ${bookingDetails.propertyName}</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        <p>This is a friendly reminder that your stay at <strong>${bookingDetails.propertyName}</strong> is scheduled for <strong>tomorrow</strong>!</p>
        
        <div class="booking-details">
          <h3>📋 Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
          <p><strong>Property:</strong> ${bookingDetails.propertyName}</p>
          <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> Rp ${Number(bookingDetails.totalAmount).toLocaleString('id-ID')}</p>
          <p><strong>Payment Status:</strong> <span class="status-badge">${bookingDetails.paymentStatus}</span></p>
        </div>

        ${bookingDetails.paymentStatus === 'PENDING_PAYMENT'
        ? `<p>⚠️ Your booking is still pending payment. Please complete your payment as soon as possible to avoid cancellation.</p>
                 <a href="#" class="btn">Complete Payment Now</a>`
        : `<p>✅ Your payment is confirmed. All set for a great stay!</p>`}

        <p>If you need to make any last-minute changes or have questions, feel free to reach out to us.</p>
        
        <p>Looking forward to welcoming you,<br><strong>The ProRent Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; 2025 ProRent. All rights reserved.</p>
        <p>This is an automated message, please do not reply directly.</p>
      </div>
    </body>
    </html>
  `;
};
exports.createBookingReminderTemplate = createBookingReminderTemplate;
