import { PrismaClient } from '@prisma/client';
import cloudinary from '../../config/third-party/cloudinary';
import logger from '../../utils/system/logger';
import path from 'path';
import { validateFileType, validateFileSize, avatarUploadSchema } from '../../validations/upload/uploadValidation';
import prisma from '../../prisma';

class AvatarUploadService {
   // Validate file using centralized validation
   validateFile (file: any) {
      if (!file) {
         return {
            isValid: false,
            errors: [ 'No file uploaded. Please select an image file to upload.' ]
         };
      }

      // Use centralized validation
      const allowedTypes = [ 'image/jpeg', 'image/png', 'image/webp', 'image/jpg' ];
      const maxSize = 1048576; // 1MB

      const typeValidation = validateFileType(file, allowedTypes);
      const sizeValidation = validateFileSize(file, maxSize);

      const errors: string[] = [];
      if (!typeValidation.isValid) {
         errors.push(typeValidation.error!);
      }
      if (!sizeValidation.isValid) {
         errors.push(sizeValidation.error!);
      }

      return {
         isValid: errors.length === 0,
         errors
      };
   }

   // Check Cloudinary configuration
   validateCloudinaryConfig () {
      if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
         logger.error('Cloudinary configuration missing');
         return false;
      }
      return true;
   }

   // Upload file to Cloudinary
   async uploadToCloudinary (file: any, userId: string) {
      return new Promise((resolve, reject) => {
         cloudinary.uploader
            .upload_stream(
               {
                  resource_type: 'image',
                  folder: 'prorent/avatars',
                  public_id: `avatar_${userId}_${Date.now()}`,
                  width: 300,
                  height: 300,
                  crop: 'fill',
                  quality: 'auto'
               },
               (error, result) => {
                  if (error) {
                     logger.error('Cloudinary upload error:', error);
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
   async savePicture (cloudinaryResult: any, userId: string, fileSize: number) {
      return await prisma.picture.create({
         data: {
            url: cloudinaryResult.secure_url,
            alt: `Profile picture for ${userId}`,
            type: 'profile',
            sizeKB: Math.round(fileSize / 1024)
         }
      });
   }

   // Update user profile with new avatar
   async updateUserAvatar (userId: string, pictureId: string) {
      await prisma.profile.upsert({
         where: { userId },
         update: { avatarId: pictureId },
         create: {
            userId,
            avatarId: pictureId
         }
      });
   }

   // Handle Cloudinary errors
   handleCloudinaryError (error: any) {
      if (error.message && error.message.includes('Invalid Signature')) {
         return 'Image upload service configuration error. Please try again later.';
      }

      if (error.message && error.message.includes('Invalid image')) {
         return 'Invalid image file. Please upload a valid image.';
      }

      return 'Error uploading image. Please try again.';
   }
}

export default new AvatarUploadService();
