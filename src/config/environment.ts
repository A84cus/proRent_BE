// Environment Variables Configuration
import 'dotenv/config';

// App Configuration
export const APP_CONFIG = {
   PORT: process.env.PORT,
   NODE_ENV: process.env.NODE_ENV,
   JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key'
} as const;

// Third-party Service Configuration
export const THIRD_PARTY_CONFIG = {
   // Cloudinary
   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,

   // Xendit
   XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
   XENDIT_WEBHOOK_TOKEN: process.env.XENDIT_WEBHOOK_TOKEN,
   XENDIT_CALLBACK_BASE_URL: process.env.XENDIT_CALLBACK_BASE_URL,

   // Email
   SMTP_HOST: process.env.SMTP_HOST,
   SMTP_PORT: process.env.SMTP_PORT,
   SMTP_USER: process.env.SMTP_USER,
   SMTP_PASS: process.env.SMTP_PASS,
   SMTP_FROM: process.env.SMTP_FROM,
   LOGO_URL: process.env.LOGO_URL,
   GMAIL_USER: process.env.GMAIL_USER,
   GMAIL_PASS: process.env.GMAIL_PASS,
   USE_GMAIL: process.env.USE_GMAIL,
   USE_DISPOSABLE: process.env.USE_DISPOSABLE,
   BASE_FE_URL: process.env.BASE_FE_URL,
   CRON_API_KEY: process.env.CRON_API_KEY
} as const;

// CronJob

// Legacy exports for backward compatibility
export const {
   PORT,
   BASE_FE_URL,
   CLOUDINARY_API_KEY,
   CLOUDINARY_API_SECRET,
   CLOUDINARY_CLOUD_NAME,
   NODE_ENV,
   XENDIT_SECRET_KEY,
   XENDIT_WEBHOOK_TOKEN,
   XENDIT_CALLBACK_BASE_URL,
   SMTP_HOST,
   SMTP_PORT,
   SMTP_USER,
   SMTP_PASS,
   SMTP_FROM,
   LOGO_URL,
   GMAIL_USER,
   GMAIL_PASS,
   USE_GMAIL
} = process.env;

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Re-export domain configurations
export * from './app';
export * from './third-party';
