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
const logger_1 = __importDefault(require("../utils/logger"));
const fileValidationService_1 = __importDefault(require("./fileValidationService"));
const cloudStorageService_1 = __importDefault(require("./cloudStorageService"));
const imageTransformationService_1 = __importDefault(require("./imageTransformationService"));
class FileUploadService {
    // Upload profile picture
    uploadProfile(buffer, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadFile(buffer, filename, "profile");
        });
    }
    // Upload property image
    uploadProperty(buffer, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadFile(buffer, filename, "property");
        });
    }
    // Upload room image
    uploadRoom(buffer, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadFile(buffer, filename, "room");
        });
    }
    // Upload proof document
    uploadProof(buffer, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadFile(buffer, filename, "proof");
        });
    }
    // Generic upload method
    uploadFile(buffer, filename, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate file
                const mockFile = {
                    buffer,
                    originalname: filename,
                    mimetype: this.getMimeType(filename),
                };
                const validation = fileValidationService_1.default.validateFile(mockFile, type);
                if (!validation.isValid) {
                    throw new Error(validation.errors.join(", "));
                }
                // Get transformation settings
                const transformation = imageTransformationService_1.default.shouldTransform(filename)
                    ? imageTransformationService_1.default.getTransformationSettings(type)
                    : undefined;
                // Upload to cloud storage
                const result = yield cloudStorageService_1.default.uploadBuffer(buffer, filename, {
                    folder: imageTransformationService_1.default.getFolderPath(type),
                    resource_type: imageTransformationService_1.default.getResourceType(filename),
                    transformation,
                });
                logger_1.default.info(`${type} file uploaded successfully: ${result.id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`${type} upload error:`, error);
                throw error;
            }
        });
    }
    // Delete file
    deleteFile(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            return cloudStorageService_1.default.deleteFile(publicId);
        });
    }
    // Get file info
    getFileInfo(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            return cloudStorageService_1.default.getFileInfo(publicId);
        });
    }
    // Validate file type (keep for backward compatibility)
    isValidFileType(filename, type) {
        return fileValidationService_1.default.isValidFileType(filename, type);
    }
    // Helper method to get MIME type
    getMimeType(filename) {
        var _a;
        const extension = (_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const mimeMap = {
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
exports.default = new FileUploadService();
