import 'dotenv/config';

export const { PORT, BASE_FE_URL, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
