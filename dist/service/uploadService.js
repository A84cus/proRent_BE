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
const fileUploadService_1 = __importDefault(require("./fileUploadService"));
const fileRepository_1 = __importDefault(require("../repository/fileRepository"));
const logger_1 = __importDefault(require("../utils/logger"));
class UploadService {
    // Process file upload
    processFileUpload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { buffer, originalname, type, alt } = data;
            // Validate file type
            if (!fileUploadService_1.default.isValidFileType(originalname, type)) {
                throw new Error(`Invalid file type for ${type} upload. Please check allowed formats.`);
            }
            let uploadResult;
            // Upload based on type
            switch (type) {
                case "profile":
                    uploadResult = yield fileUploadService_1.default.uploadProfile(buffer, originalname);
                    break;
                case "property":
                    uploadResult = yield fileUploadService_1.default.uploadProperty(buffer, originalname);
                    break;
                case "room":
                    uploadResult = yield fileUploadService_1.default.uploadRoom(buffer, originalname);
                    break;
                case "proof":
                    uploadResult = yield fileUploadService_1.default.uploadProof(buffer, originalname);
                    break;
                default:
                    throw new Error("Invalid upload type specified.");
            }
            // Save to database
            const picture = yield fileRepository_1.default.create({
                url: uploadResult.url,
                alt: alt || originalname,
                type: type,
                sizeKB: Math.round(uploadResult.bytes / 1024),
            });
            logger_1.default.info(`File uploaded successfully: ${uploadResult.id}, DB ID: ${picture.id}, Type: ${type}`);
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
        });
    }
    // Delete file
    deleteFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get file from database
            const picture = yield fileRepository_1.default.findById(id);
            if (!picture) {
                throw new Error("File not found");
            }
            // Extract public ID from URL
            const publicId = this.extractPublicIdFromUrl(picture.url || "", picture.type || "");
            // Delete from Cloudinary
            yield fileUploadService_1.default.deleteFile(publicId);
            // Delete from database
            yield fileRepository_1.default.deleteById(id);
            logger_1.default.info(`File deleted successfully: ${id}`);
        });
    }
    // Get file info
    getFileInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const picture = yield fileRepository_1.default.findById(id);
            if (!picture) {
                throw new Error("File not found");
            }
            return picture;
        });
    }
    // List files with pagination
    listFiles(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, type } = options;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            if (type) {
                where.type = type;
            }
            // Get files and count
            const [pictures, total] = yield Promise.all([
                fileRepository_1.default.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                fileRepository_1.default.count(where),
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
        });
    }
    // Helper method to extract public ID from URL
    extractPublicIdFromUrl(url, type) {
        const urlParts = url.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        return `prorent/${type}s/${publicId}`;
    }
}
exports.default = new UploadService();
