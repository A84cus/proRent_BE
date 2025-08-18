// Disposable Mail Integration for ProRent
// Note: Disposable Mail is for receiving emails, not sending them
// We'll use it as a destination for testing emails

import nodemailer from "nodemailer";
import { EmailConfig } from "../../interfaces";
import { THIRD_PARTY_CONFIG } from "../environment";

// Configuration for using free SMTP services with disposable email destinations
const freeEmailConfigs = {
  // Gmail SMTP (free tier)
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
  },

  // Outlook/Hotmail SMTP (free)
  outlook: {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    service: "hotmail",
  },

  // Yahoo SMTP (free)
  yahoo: {
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    service: "yahoo",
  },

  // Ethereal Email (testing)
  ethereal: {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
  },
};

// Disposable email domains for testing
const disposableEmailDomains = [
  "@disposablemail.com",
  "@tempmail.com",
  "@10minutemail.com",
  "@mailinator.com",
  "@guerrillamail.com",
];

export const emailConfig: EmailConfig =
  THIRD_PARTY_CONFIG.USE_GMAIL === "true"
    ? {
        host: freeEmailConfigs.gmail.host,
        port: freeEmailConfigs.gmail.port,
        secure: freeEmailConfigs.gmail.secure,
        user: THIRD_PARTY_CONFIG.SMTP_USER || "",
        pass: THIRD_PARTY_CONFIG.SMTP_PASS || "",
        from: THIRD_PARTY_CONFIG.SMTP_FROM || "",
        frontendUrl: THIRD_PARTY_CONFIG.BASE_FE_URL || "http://localhost:3000",
      }
    : THIRD_PARTY_CONFIG.USE_OUTLOOK === "true"
    ? {
        host: freeEmailConfigs.outlook.host,
        port: freeEmailConfigs.outlook.port,
        secure: freeEmailConfigs.outlook.secure,
        user: THIRD_PARTY_CONFIG.SMTP_USER || "",
        pass: THIRD_PARTY_CONFIG.SMTP_PASS || "",
        from: THIRD_PARTY_CONFIG.SMTP_FROM || "",
        frontendUrl: THIRD_PARTY_CONFIG.BASE_FE_URL || "http://localhost:3000",
      }
    : THIRD_PARTY_CONFIG.USE_ETHEREAL === "true"
    ? {
        host: freeEmailConfigs.ethereal.host,
        port: freeEmailConfigs.ethereal.port,
        secure: freeEmailConfigs.ethereal.secure,
        user: THIRD_PARTY_CONFIG.SMTP_USER || "",
        pass: THIRD_PARTY_CONFIG.SMTP_PASS || "",
        from: THIRD_PARTY_CONFIG.SMTP_FROM || "",
        frontendUrl: THIRD_PARTY_CONFIG.BASE_FE_URL || "http://localhost:3000",
      }
    : {
        host: THIRD_PARTY_CONFIG.SMTP_HOST || "",
        port: parseInt(THIRD_PARTY_CONFIG.SMTP_PORT || "587"),
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
  } else if (THIRD_PARTY_CONFIG.USE_OUTLOOK === "true") {
    transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else if (THIRD_PARTY_CONFIG.USE_ETHEREAL === "true") {
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

// Utility function to generate disposable email for testing
export const generateDisposableEmail = (
  prefix: string = "prorent-test"
): string => {
  const randomId = Math.random().toString(36).substring(2, 15);
  const domain =
    disposableEmailDomains[
      Math.floor(Math.random() * disposableEmailDomains.length)
    ];
  return `${prefix}-${randomId}${domain}`;
};

// Utility function to check if email is disposable
export const isDisposableEmail = (email: string): boolean => {
  return disposableEmailDomains.some((domain) =>
    email.toLowerCase().includes(domain)
  );
};

export default emailConfig;
