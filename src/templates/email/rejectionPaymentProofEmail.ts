import { BookingDetails, UserWithProfile } from '../../interfaces/email/email.interface';
import { LOGO_URL } from '../../config';

export const createPaymentProofRejectionTemplate = (user: UserWithProfile, bookingDetails: BookingDetails): string => {
   const firstName = user.profile?.firstName || user.profile?.lastName || 'Valued Guest';
   const fullName =
      user.profile?.firstName && user.profile?.lastName
         ? `${user.profile.firstName} ${user.profile.lastName}`
         : firstName;

   return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Proof Review Required - ProRent</title>
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
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
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
        .rejection-details { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #dc3545;
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
          background-color: #dc3545;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .warning-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${LOGO_URL}" alt="ProRent Logo" width="100" style="display: block; max-width: 100px; width: 100px; height: auto; margin: 0 auto 15px auto;">
        <h1>Payment Proof Review Required</h1>
        <p>Action needed to complete your reservation</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        <p>We've reviewed your payment proof for reservation <strong>${
           bookingDetails.id
        }</strong>, but unfortunately, we need to request a new upload.</p>
        
        <div class="rejection-details">
          <h3>⚠️ Rejection Details</h3>
          <p><strong>Reservation ID:</strong> ${bookingDetails.id}</p>
          <p><strong>Rejection Reason: </strong></p>
          <p style="background-color: #f8d7da; padding: 10px; border-radius: 4px; border-left: 3px solid #dc3545;">
          Image does not meet requirements
          </p>
        </div>

        <div class="warning-box">
          <h4>📋 Requirements for Reupload:</h4>
          <ul>
            <li>Image must be clear and not blurry</li>
            <li>All details must be visible (amount, date, reference number)</li>
            <li>File format: JPG, PNG, or PDF</li>
            <li>File size: Maximum 5MB</li>
          </ul>
        </div>

        <p>Please reupload your payment proof as soon as possible to secure your reservation.</p>
        
        <a href="${process.env.FRONTEND_URL || 'prorent-fe.vercel.app'}/payment/${
      bookingDetails.id
   }" class="btn">Reupload Payment Proof</a>

        <p><strong>Important:</strong> Your reservation will be automatically cancelled if we don't receive a valid payment proof within 24 hours.</p>

        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
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
