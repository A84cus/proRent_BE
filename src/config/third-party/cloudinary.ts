import { v2 as cloudinary } from "cloudinary";
import { THIRD_PARTY_CONFIG } from "../environment";

// Configure Cloudinary
cloudinary.config({
  cloud_name: THIRD_PARTY_CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: THIRD_PARTY_CONFIG.CLOUDINARY_API_KEY,
  api_secret: THIRD_PARTY_CONFIG.CLOUDINARY_API_SECRET,
});

export default cloudinary;
