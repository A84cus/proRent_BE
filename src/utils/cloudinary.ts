import { UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";
import cloudinary from "../config/cloudinary";

export const cloudinaryUpload = (
  file: Express.Multer.File,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(upload);
  });
};

export const cloudinaryRemove = async (secure_url: string) => {
  try {
    const publicId = extractPublicIdFromUrl(secure_url);
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

const extractPublicIdFromUrl = (url: string): string => {
  const urlParts = url.split("/");
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split(".")[0];
  return publicId;
};
