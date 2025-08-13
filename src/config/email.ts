import nodemailer from 'nodemailer';
import { EmailConfig } from '../interfaces/email.interface';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, BASE_FE_URL } from '../config/index';

export const emailConfig: EmailConfig = {
   host: SMTP_HOST || 'sandbox.smtp.mailtrap.io',
   port: parseInt(SMTP_PORT || '2525'),
   secure: false, // true for 465, false for other ports
   user: SMTP_USER || '5afc643591b70e',
   pass: SMTP_PASS || 'c3ffe7e5804c14',
   from: SMTP_FROM || 'proprerent@gmail.com',
   frontendUrl: BASE_FE_URL || 'http://localhost:3000'
};

export const createEmailTransporter = () => {
   return nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
         user: emailConfig.user,
         pass: emailConfig.pass
      }
   });
};
