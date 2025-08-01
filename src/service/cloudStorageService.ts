import { Readable } from "stream";
import cloudinary from "../config/cloudinary";
import logger from "../utils/logger";
import {
  CloudUploadOptions,
  CloudUploadResult,
} from "../interfaces/cloudStorage.interface";

class CloudStorageService {
  // Generic upload to cloudinary
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    options: CloudUploadOptions
  ): Promise<CloudUploadResult> {
    try {
      const uploadOptions: any = {
        folder: options.folder,
        resource_type: options.resource_type || "auto",
        public_id: `${Date.now()}_${filename.split(".")[0]}`,
        use_filename: true,
        unique_filename: true,
      };

      // Add transformations if provided
      if (options.transformation) {
        uploadOptions.transformation = options.transformation;
      }

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              reject(new Error(`Upload failed: ${error.message}`));
            } else if (result) {
              logger.info(`File uploaded successfully: ${result.public_id}`);
              resolve({
                id: result.public_id,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                createdAt: result.created_at,
              });
            } else {
              reject(new Error("Upload failed: No result from Cloudinary"));
            }
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });
    } catch (error) {
      logger.error("Cloud storage upload error:", error);
      throw error;
    }
  }

  // Delete file from cloudinary
  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "ok") {
        logger.info(`File deleted successfully: ${publicId}`);
      } else {
        logger.warn(`File deletion result: ${result.result} for ${publicId}`);
      }
    } catch (error) {
      logger.error("File deletion error:", error);
      throw new Error("Failed to delete file");
    }
  }

  // Get file information
  async getFileInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        id: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at,
      };
    } catch (error) {
      logger.error("Get file info error:", error);
      throw new Error("Failed to get file information");
    }
  }
}

export default new CloudStorageService();
