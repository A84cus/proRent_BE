import nodemailer from "nodemailer";
import { EmailConfig } from "../../interfaces";
import { THIRD_PARTY_CONFIG } from "../environment";

export const emailConfig: EmailConfig =
  THIRD_PARTY_CONFIG.USE_GMAIL === "true"
    ? {
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for 587
        user:
          THIRD_PARTY_CONFIG.SMTP_USER || THIRD_PARTY_CONFIG.GMAIL_USER || "",
        pass:
          THIRD_PARTY_CONFIG.SMTP_PASS || THIRD_PARTY_CONFIG.GMAIL_PASS || "",
        from: THIRD_PARTY_CONFIG.SMTP_FROM || "",
        frontendUrl: THIRD_PARTY_CONFIG.BASE_FE_URL || "http://localhost:3000",
      }
    : {
        host: THIRD_PARTY_CONFIG.SMTP_HOST || "",
        port: parseInt(THIRD_PARTY_CONFIG.SMTP_PORT || "2525"),
        secure: false,
        user: THIRD_PARTY_CONFIG.SMTP_USER || "",
        pass: THIRD_PARTY_CONFIG.SMTP_PASS || "",
        from: THIRD_PARTY_CONFIG.SMTP_FROM || "",
        frontendUrl: THIRD_PARTY_CONFIG.BASE_FE_URL || "http://localhost:3000",
      };

export const createEmailTransporter = () => {
  let transporter;

  if (THIRD_PARTY_CONFIG.USE_GMAIL === "true") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
};

export default emailConfig;
