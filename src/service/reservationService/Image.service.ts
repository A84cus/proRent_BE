import {
  cloudinaryUpload,
  cloudinaryRemove,
} from "../../utils/upload/cloudinary";
import { Express } from "express";

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const result = await cloudinaryUpload(file, folder);
  return result.secure_url;
};

export const removeImage = async (url: string) => {
  await cloudinaryRemove(url);
};

export const updateImage = async (
  file: Express.Multer.File,
  folder: string,
  url: string
) => {
  await cloudinaryRemove(url);
  return await uploadImage(file, folder);
};
