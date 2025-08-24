"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
class MulterConfigService {
    // Configure multer for memory storage
    createMulterConfig() {
        return (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
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
exports.default = new MulterConfigService();
