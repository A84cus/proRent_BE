import nodemailer from "nodemailer";
import { EmailConfig } from "../interfaces/email.interface";

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: false, // true for 465, false for other ports
  user: process.env.SMTP_USER || "5afc643591b70e",
  pass: process.env.SMTP_PASS || "c3ffe7e5804c14",
  from: process.env.SMTP_FROM || "proprerent@gmail.com",
  frontendUrl: process.env.FRONTEND_URL || "https://pro-rentbe.vercel.app",
};

export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
};
