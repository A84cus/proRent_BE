<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinary";
import logger from "../utils/logger";
import path from "path";

const prisma = new PrismaClient();

class AvatarUploadService {
  // Validate file
  validateFile(file: any) {
    const errors: string[] = [];

    if (!file) {
      errors.push("No file uploaded. Please select an image file to upload.");
      return { isValid: false, errors };
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      errors.push(
        "File size too large. Please upload an image smaller than 1MB (1024 KB)."
      );
    }

    // Validate file extension
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(
        `Invalid file type. Only ${allowedExtensions.join(
          ", "
        )} files are allowed. Current file type: ${fileExtension}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check Cloudinary configuration
  validateCloudinaryConfig() {
    if (
      !cloudinary.config().cloud_name ||
      !cloudinary.config().api_key ||
      !cloudinary.config().api_secret
    ) {
      logger.error("Cloudinary configuration missing");
      return false;
    }
    return true;
  }

  // Upload file to Cloudinary
  async uploadToCloudinary(file: any, userId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "prorent/avatars",
            public_id: `avatar_${userId}_${Date.now()}`,
            width: 300,
            height: 300,
            crop: "fill",
            quality: "auto",
          },
          (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(file.buffer);
    });
  }

  // Save picture to database
  async savePicture(cloudinaryResult: any, userId: string, fileSize: number) {
    return await prisma.picture.create({
      data: {
        url: cloudinaryResult.secure_url,
        alt: `Profile picture for ${userId}`,
        type: "profile",
        sizeKB: Math.round(fileSize / 1024),
      },
    });
  }

  // Update user profile with new avatar
  async updateUserAvatar(userId: string, pictureId: string) {
    await prisma.profile.upsert({
      where: { userId },
      update: { avatarId: pictureId },
      create: {
        userId,
        avatarId: pictureId,
      },
    });
  }

  // Handle Cloudinary errors
  handleCloudinaryError(error: any) {
    if (error.message && error.message.includes("Invalid Signature")) {
      return "Image upload service configuration error. Please try again later.";
    }

    if (error.message && error.message.includes("Invalid image")) {
      return "Invalid image file. Please upload a valid image.";
    }

    return "Error uploading image. Please try again.";
  }
}

export default new AvatarUploadService();
=======
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinary";
import logger from "../utils/logger";
import path from "path";

const prisma = new PrismaClient();

class AvatarUploadService {
  // Validate file
  validateFile(file: any) {
    const errors: string[] = [];

    if (!file) {
      errors.push("No file uploaded. Please select an image file to upload.");
      return { isValid: false, errors };
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      errors.push(
        "File size too large. Please upload an image smaller than 1MB (1024 KB)."
      );
    }

    // Validate file extension
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(
        `Invalid file type. Only ${allowedExtensions.join(
          ", "
        )} files are allowed. Current file type: ${fileExtension}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check Cloudinary configuration
  validateCloudinaryConfig() {
    if (
      !cloudinary.config().cloud_name ||
      !cloudinary.config().api_key ||
      !cloudinary.config().api_secret
    ) {
      logger.error("Cloudinary configuration missing");
      return false;
    }
    return true;
  }

  // Upload file to Cloudinary
  async uploadToCloudinary(file: any, userId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "prorent/avatars",
            public_id: `avatar_${userId}_${Date.now()}`,
            width: 300,
            height: 300,
            crop: "fill",
            quality: "auto",
          },
          (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(file.buffer);
    });
  }

  // Save picture to database
  async savePicture(cloudinaryResult: any, userId: string, fileSize: number) {
    return await prisma.picture.create({
      data: {
        url: cloudinaryResult.secure_url,
        alt: `Profile picture for ${userId}`,
        type: "profile",
        sizeKB: Math.round(fileSize / 1024),
      },
    });
  }

  // Update user profile with new avatar
  async updateUserAvatar(userId: string, pictureId: string) {
    await prisma.profile.upsert({
      where: { userId },
      update: { avatarId: pictureId },
      create: {
        userId,
        avatarId: pictureId,
      },
    });
  }

  // Handle Cloudinary errors
  handleCloudinaryError(error: any) {
    if (error.message && error.message.includes("Invalid Signature")) {
      return "Image upload service configuration error. Please try again later.";
    }

    if (error.message && error.message.includes("Invalid image")) {
      return "Invalid image file. Please upload a valid image.";
    }

    return "Error uploading image. Please try again.";
  }
}

export default new AvatarUploadService();
>>>>>>> e5aee09f905eadbba2f45a60016b8ef41b7ffeaa
