"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const fileValidationService_1 = __importDefault(require("../service/fileValidationService"));
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
                var _a;
                // Get upload type from request body
                const type = (_a = req.body) === null || _a === void 0 ? void 0 : _a.type;
                if (!type) {
                    return cb(new Error("Upload type is required"));
                }
                // Validate MIME type
                const validation = fileValidationService_1.default.validateMimeType(file.mimetype, type);
                if (validation.isValid) {
                    cb(null, true);
                }
                else {
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
exports.default = new MulterConfigService();
