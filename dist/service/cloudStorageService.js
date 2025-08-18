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
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const logger_1 = __importDefault(require("../utils/logger"));
class CloudStorageService {
    // Generic upload to cloudinary
    uploadBuffer(buffer, filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadOptions = {
                    folder: options.folder,
                    resource_type: options.resource_type ||
                        "auto",
                    public_id: `${Date.now()}_${filename.split(".")[0]}`,
                    use_filename: true,
                    unique_filename: true,
                };
                // Add transformations if provided
                if (options.transformation) {
                    uploadOptions.transformation = options.transformation;
                }
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error) {
                            logger_1.default.error("Cloudinary upload error:", error);
                            reject(new Error(`Upload failed: ${error.message}`));
                        }
                        else if (result) {
                            logger_1.default.info(`File uploaded successfully: ${result.public_id}`);
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
                        }
                        else {
                            reject(new Error("Upload failed: No result from Cloudinary"));
                        }
                    });
                    const bufferStream = new stream_1.Readable();
                    bufferStream.push(buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(uploadStream);
                });
            }
            catch (error) {
                logger_1.default.error("Cloud storage upload error:", error);
                throw error;
            }
        });
    }
    // Delete file from cloudinary
    deleteFile(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.default.uploader.destroy(publicId);
                if (result.result === "ok") {
                    logger_1.default.info(`File deleted successfully: ${publicId}`);
                }
                else {
                    logger_1.default.warn(`File deletion result: ${result.result} for ${publicId}`);
                }
            }
            catch (error) {
                logger_1.default.error("File deletion error:", error);
                throw new Error("Failed to delete file");
            }
        });
    }
    // Get file information
    getFileInfo(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.default.api.resource(publicId);
                return {
                    id: result.public_id,
                    url: result.secure_url,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    bytes: result.bytes,
                    createdAt: result.created_at,
                };
            }
            catch (error) {
                logger_1.default.error("Get file info error:", error);
                throw new Error("Failed to get file information");
            }
        });
    }
}
exports.default = new CloudStorageService();
