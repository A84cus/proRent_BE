"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingCancellationByOwnerTemplate = exports.createBookingCancellationByUserTemplate = void 0;
const config_1 = require("../../config");
// Version 1: Canceled by User
const createBookingCancellationByUserTemplate = (user, bookingDetails) => {
    var _a, _b, _c, _d;
    const firstName = ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || ((_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName) || 'Valued Guest';
    const fullName = ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.firstName) && ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.lastName)
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : firstName;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancellation Confirmation - ProRent</title>
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
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%); 
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
        .cancellation-details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #6c757d;
        }
        .refund-info {
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #17a2b8;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #6c757d; 
          font-size: 14px; 
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background-color: #6c757d;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${config_1.LOGO_URL}" alt="ProRent Logo" width="100" style="display: block; max-width: 100px; width: 100px; height: auto; margin: 0 auto 15px auto;">
        <h1>Booking Cancellation Confirmed</h1>
        <p>Your reservation has been successfully cancelled</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        <p>We've received your cancellation request for reservation <strong>${bookingDetails.id}</strong> and have processed it successfully.</p>
        
        <div class="cancellation-details">
          <h3>📋 Cancellation Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
          <p><strong>Property:</strong> ${bookingDetails.propertyName}</p>
          <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status-badge">CANCELLED</span></p>
        </div>      

        <p>We're sorry to see you cancel your booking. If you have any questions about the cancellation or would like to make a new reservation in the future, please don't hesitate to contact us.</p>
        
        <p>Thank you for considering ProRent.</p>
        <p>Best regards,<br><strong>The ProRent Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; 2025 ProRent. All rights reserved.</p>
        <p>This is an automated message, please do not reply directly.</p>
      </div>
    </body>
    </html>
  `;
};
exports.createBookingCancellationByUserTemplate = createBookingCancellationByUserTemplate;
// Version 2: Canceled by Owner
const createBookingCancellationByOwnerTemplate = (user, bookingDetails) => {
    var _a, _b, _c, _d;
    const firstName = ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || ((_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName) || 'Valued Guest';
    const fullName = ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.firstName) && ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.lastName)
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : firstName;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Important: Booking Cancellation Notice - ProRent</title>
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
          background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%); 
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
        .cancellation-details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #dc3545;
        }
        .reason-box {
          background-color: #f8d7da;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #dc3545;
        }
        .refund-info {
          background-color: #d1ecf1;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #17a2b8;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #6c757d; 
          font-size: 14px; 
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background-color: #dc3545;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${config_1.LOGO_URL}" alt="ProRent Logo" width="100" style="display: block; max-width: 100px; width: 100px; height: auto; margin: 0 auto 15px auto;">
        <h1>Important: <br/> Booking Cancellation Notice</h1>
        <p>Your reservation has been cancelled by the ${bookingDetails.propertyName} organizer</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        <p>We regret to inform you that your reservation <strong>${bookingDetails.id}</strong> for <strong>${bookingDetails.propertyName}</strong> has been cancelled by the ${bookingDetails.propertyName} organizer.</p>
        
        <div class="cancellation-details">
          <h3>📋 Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
          <p><strong>Property:</strong> ${bookingDetails.propertyName}</p>
          <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status-badge">CANCELLED</span></p>
        </div>      

        <p>We understand this may be disappointing. Our team is here to help you find alternative accommodation if needed. Please contact us at support@prorent.com or call our customer service.</p>
        
        <p>We value your understanding and hope to serve you better in the future.</p>
        <p>Sincerely,<br><strong>The ProRent Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; 2025 ProRent. All rights reserved.</p>
        <p>This is an automated message, please do not reply directly.</p>
      </div>
    </body>
    </html>
  `;
};
exports.createBookingCancellationByOwnerTemplate = createBookingCancellationByOwnerTemplate;
