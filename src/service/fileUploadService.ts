import logger from "../utils/logger";
import fileValidationService from "./fileValidationService";
import cloudStorageService from "./cloudStorageService";
import imageTransformationService from "./imageTransformationService";
import { FileType, UploadResult } from "../interfaces/upload.interface";

class FileUploadService {
  // Upload profile picture
  async uploadProfile(buffer: Buffer, filename: string): Promise<UploadResult> {
    return this.uploadFile(buffer, filename, "profile");
  }

  // Upload property image
  async uploadProperty(
    buffer: Buffer,
    filename: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, filename, "property");
  }

  // Upload room image
  async uploadRoom(buffer: Buffer, filename: string): Promise<UploadResult> {
    return this.uploadFile(buffer, filename, "room");
  }

  // Upload proof document
  async uploadProof(buffer: Buffer, filename: string): Promise<UploadResult> {
    return this.uploadFile(buffer, filename, "proof");
  }

  // Generic upload method
  private async uploadFile(
    buffer: Buffer,
    filename: string,
    type: FileType
  ): Promise<UploadResult> {
    try {
      // Validate file
      const mockFile = {
        buffer,
        originalname: filename,
        mimetype: this.getMimeType(filename),
      };
      const validation = fileValidationService.validateFile(mockFile, type);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Get transformation settings
      const transformation = imageTransformationService.shouldTransform(
        filename
      )
        ? imageTransformationService.getTransformationSettings(type)
        : undefined;

      // Upload to cloud storage
      const result = await cloudStorageService.uploadBuffer(buffer, filename, {
        folder: imageTransformationService.getFolderPath(type),
        resource_type: imageTransformationService.getResourceType(filename),
        transformation,
      });

      logger.info(`${type} file uploaded successfully: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`${type} upload error:`, error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(publicId: string): Promise<void> {
    return cloudStorageService.deleteFile(publicId);
  }

  // Get file info
  async getFileInfo(publicId: string): Promise<any> {
    return cloudStorageService.getFileInfo(publicId);
  }

  // Validate file type (keep for backward compatibility)
  isValidFileType(filename: string, type: FileType): boolean {
    return fileValidationService.isValidFileType(filename, type);
  }

  // Helper method to get MIME type
  private getMimeType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return mimeMap[extension || ""] || "application/octet-stream";
  }
}

export default new FileUploadService();
