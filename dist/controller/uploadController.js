"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const uploadService_1 = __importDefault(require("../service/uploadService"));
const multerConfigService_1 = __importDefault(require("../service/multerConfigService"));
const responseHelper_1 = __importDefault(require("../helpers/responseHelper"));
const authorizationHelper_1 = __importDefault(require("../helpers/authorizationHelper"));
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../helpers/errorHandler");
const utilityValidation_1 = require("../validations/utilityValidation");
class UploadController {
    // POST /upload - Generic file upload endpoint
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request body
                const validatedData = utilityValidation_1.uploadFileSchema.parse(req.body);
                const { type, alt } = validatedData;
                // Check if file exists
                if (!req.file) {
                    return responseHelper_1.default.badRequest(res, "No file provided. Please upload a file.");
                }
                // Check authorization
                const authCheck = authorizationHelper_1.default.canUploadType(req, type);
                if (!authCheck.canUpload) {
                    return responseHelper_1.default.unauthorized(res, authCheck.error);
                }
                // Process file upload
                const result = yield uploadService_1.default.processFileUpload({
                    buffer: req.file.buffer,
                    originalname: req.file.originalname,
                    type,
                    alt,
                    userId: authorizationHelper_1.default.getUserId(req),
                });
                return responseHelper_1.default.uploadSuccess(res, result);
            }
            catch (error) {
                (0, errorHandler_1.handleUploadError)(res, error, "File upload");
            }
        });
    }
    // DELETE /upload/:id - Delete uploaded file
    deleteFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return responseHelper_1.default.badRequest(res, "File ID is required");
                }
                // Check authorization
                const authCheck = authorizationHelper_1.default.canDeleteFile(req);
                if (!authCheck.canDelete) {
                    return responseHelper_1.default.unauthorized(res, authCheck.error);
                }
                // Delete file
                yield uploadService_1.default.deleteFile(id);
                return responseHelper_1.default.deleteSuccess(res);
            }
            catch (error) {
                logger_1.default.error("File deletion error:", error);
                if (error instanceof Error) {
                    if (error.message === "File not found") {
                        return responseHelper_1.default.notFound(res, "File");
                    }
                    return responseHelper_1.default.badRequest(res, error.message);
                }
                return responseHelper_1.default.serverError(res, "Internal server error during file deletion");
            }
        });
    }
    // GET /upload/:id - Get file information
    getFileInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return responseHelper_1.default.badRequest(res, "File ID is required");
                }
                const picture = yield uploadService_1.default.getFileInfo(id);
                return responseHelper_1.default.success(res, "File information retrieved successfully", {
                    id: picture.id,
                    url: picture.url,
                    alt: picture.alt,
                    type: picture.type,
                    sizeKB: picture.sizeKB,
                    uploadedAt: picture.uploadedAt,
                    createdAt: picture.createdAt,
                    updatedAt: picture.updatedAt,
                });
            }
            catch (error) {
                logger_1.default.error("Get file info error:", error);
                if (error instanceof Error && error.message === "File not found") {
                    return responseHelper_1.default.notFound(res, "File");
                }
                return responseHelper_1.default.serverError(res);
            }
        });
    }
    // GET /upload - List uploaded files (with pagination)
    listFiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const type = req.query.type;
                const userId = authorizationHelper_1.default.getUserId(req);
                const result = yield uploadService_1.default.listFiles({
                    page,
                    limit,
                    type,
                    userId,
                });
                return responseHelper_1.default.paginated(res, "Files retrieved successfully", result.pictures, result.pagination);
            }
            catch (error) {
                logger_1.default.error("List files error:", error);
                return responseHelper_1.default.serverError(res);
            }
        });
    }
}
// Middleware wrapper for multer
exports.uploadMiddleware = multerConfigService_1.default.getUploadMiddleware();
exports.default = new UploadController();
