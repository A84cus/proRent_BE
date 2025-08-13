import 'dotenv/config';

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
   SMTP_FROM
} = process.env;
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
