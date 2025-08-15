import nodemailer from 'nodemailer';
import { EmailConfig } from '../interfaces/email.interface';
import {
   SMTP_HOST,
   SMTP_PORT,
   SMTP_USER,
   SMTP_PASS,
   SMTP_FROM,
   BASE_FE_URL,
   USE_GMAIL,
   GMAIL_PASS
} from '../config/index';

export const emailConfig: EmailConfig = {
   host: 'smtp.gmail.com',
   port: 587,
   secure: false, // true untuk port 465, false untuk 587
   user: SMTP_FROM || '',
   pass: GMAIL_PASS || '',
   from: SMTP_FROM || '',
   frontendUrl: BASE_FE_URL || 'http://localhost:3000'
};
// : {
//      host: SMTP_HOST || '',
//      port: parseInt(SMTP_PORT || '2525'),
//      secure: false,
//      user: SMTP_USER || '',
//      pass: SMTP_PASS || '',
//      from: SMTP_FROM || '',
//      frontendUrl: BASE_FE_URL || 'http://localhost:3000'
//   };

export const createEmailTransporter = () => {
   return nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: emailConfig.user,
         pass: emailConfig.pass
      },
      tls: {
         rejectUnauthorized: false
      }
   });
};
// transporter = nodemailer.createTransport({
//    host: emailConfig.host,
//    port: emailConfig.port,
//    secure: emailConfig.secure,
//    auth: {
//       user: emailConfig.user,
//       pass: emailConfig.pass
//    }
// });
