import multer from "multer";
import fileValidationService from "./fileValidationService";
import { FileType } from "../../interfaces";

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
        // Skip validation in fileFilter for multipart form-data
        // Validation will be done in controller after multer processes the fields
        cb(null, true);
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
