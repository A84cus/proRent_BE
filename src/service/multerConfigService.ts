import multer from "multer";
import fileValidationService from "../service/fileValidationService";
import { FileType } from "../interfaces/upload.interface";

class MulterConfigService {
  // Configure multer for memory storage
  createMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB global limit
        files: 1, // Single file upload
      },
      fileFilter: (req, file, cb) => {
        // Get upload type from request body
        const type = req.body?.type as FileType;

        if (!type) {
          return cb(new Error("Upload type is required"));
        }

        // Validate MIME type
        const validation = fileValidationService.validateMimeType(
          file.mimetype,
          type
        );

        if (validation.isValid) {
          cb(null, true);
        } else {
          cb(new Error(validation.error || "Invalid file type"));
        }
      },
    });
  }

  // Get upload middleware
  getUploadMiddleware() {
    const upload = this.createMulterConfig();
    return upload.single("file");
  }
}

export default new MulterConfigService();
