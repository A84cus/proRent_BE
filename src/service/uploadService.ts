import fileUploadService from "./fileUploadService";
import fileRepository from "../repository/fileRepository";
import { FileType, UploadResult } from "../interfaces/upload.interface";
import { Picture } from "@prisma/client";
import logger from "../utils/logger";
import {
  UploadFileData,
  UploadResponse,
} from "../interfaces/uploadService.interface";

class UploadService {
  // Process file upload
  async processFileUpload(data: UploadFileData): Promise<UploadResponse> {
    const { buffer, originalname, type, alt } = data;

    // Validate file type
    if (!fileUploadService.isValidFileType(originalname, type)) {
      throw new Error(
        `Invalid file type for ${type} upload. Please check allowed formats.`
      );
    }

    let uploadResult: UploadResult;

    // Upload based on type
    switch (type) {
      case "profile":
        uploadResult = await fileUploadService.uploadProfile(
          buffer,
          originalname
        );
        break;
      case "property":
        uploadResult = await fileUploadService.uploadProperty(
          buffer,
          originalname
        );
        break;
      case "room":
        uploadResult = await fileUploadService.uploadRoom(buffer, originalname);
        break;
      case "proof":
        uploadResult = await fileUploadService.uploadProof(
          buffer,
          originalname
        );
        break;
      default:
        throw new Error("Invalid upload type specified.");
    }

    // Save to database
    const picture = await fileRepository.create({
      url: uploadResult.url,
      alt: alt || originalname,
      type: type,
      sizeKB: Math.round(uploadResult.bytes / 1024),
    });

    logger.info(
      `File uploaded successfully: ${uploadResult.id}, DB ID: ${picture.id}, Type: ${type}`
    );

    return {
      id: picture.id,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      type: type,
      alt: picture.alt || originalname,
      sizeKB: picture.sizeKB || 0,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedAt: picture.uploadedAt,
      cloudinaryInfo: {
        id: uploadResult.id,
        createdAt: uploadResult.createdAt,
      },
    };
  }

  // Delete file
  async deleteFile(id: string): Promise<void> {
    // Get file from database
    const picture = await fileRepository.findById(id);

    if (!picture) {
      throw new Error("File not found");
    }

    // Extract public ID from URL
    const publicId = this.extractPublicIdFromUrl(
      picture.url || "",
      picture.type || ""
    );

    // Delete from Cloudinary
    await fileUploadService.deleteFile(publicId);

    // Delete from database
    await fileRepository.deleteById(id);

    logger.info(`File deleted successfully: ${id}`);
  }

  // Get file info
  async getFileInfo(id: string): Promise<Picture> {
    const picture = await fileRepository.findById(id);

    if (!picture) {
      throw new Error("File not found");
    }

    return picture;
  }

  // List files with pagination
  async listFiles(options: {
    page: number;
    limit: number;
    type?: string;
    userId?: string;
  }) {
    const { page, limit, type } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (type) {
      where.type = type;
    }

    // Get files and count
    const [pictures, total] = await Promise.all([
      fileRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      fileRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      pictures,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Helper method to extract public ID from URL
  private extractPublicIdFromUrl(url: string, type: string): string {
    const urlParts = url.split("/");
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split(".")[0];
    return `prorent/${type}s/${publicId}`;
  }
}

export default new UploadService();
