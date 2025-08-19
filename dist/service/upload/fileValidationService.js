"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileValidationService {
    constructor() {
        this.MAX_FILE_SIZES = {
            profile: 2 * 1024 * 1024, // 2MB
            property: 5 * 1024 * 1024, // 5MB
            room: 5 * 1024 * 1024, // 5MB
            proof: 10 * 1024 * 1024, // 10MB
        };
        this.ALLOWED_IMAGE_FORMATS = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
        ];
        this.ALLOWED_DOCUMENT_FORMATS = ["pdf", "doc", "docx"];
    }
    // Validate file size for specific type
    validateFileSize(buffer, type) {
        const maxSize = this.MAX_FILE_SIZES[type];
        if (buffer.length > maxSize) {
            return {
                isValid: false,
                error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB for ${type} files`,
            };
        }
        return { isValid: true };
    }
    // Validate file type by extension
    validateFileType(filename, type) {
        var _a;
        const extension = (_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!extension) {
            return { isValid: false, error: "File must have an extension" };
        }
        const allowedFormats = this.getAllowedFormats(type);
        if (!allowedFormats.includes(extension)) {
            return {
                isValid: false,
                error: `File format '${extension}' is not allowed for ${type}. Allowed: ${allowedFormats.join(", ")}`,
            };
        }
        return { isValid: true };
    }
    // Validate MIME type
    validateMimeType(mimetype, type) {
        const allowedMimes = this.getAllowedMimeTypes(type);
        if (!allowedMimes.includes(mimetype)) {
            return {
                isValid: false,
                error: `MIME type '${mimetype}' is not allowed for ${type} uploads`,
            };
        }
        return { isValid: true };
    }
    // Get allowed formats for file type
    getAllowedFormats(type) {
        switch (type) {
            case "profile":
            case "property":
            case "room":
                return this.ALLOWED_IMAGE_FORMATS;
            case "proof":
                return [
                    ...this.ALLOWED_IMAGE_FORMATS,
                    ...this.ALLOWED_DOCUMENT_FORMATS,
                ];
            default:
                return [];
        }
    }
    // Get allowed MIME types
    getAllowedMimeTypes(type) {
        const imageMimes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        const docMimes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        switch (type) {
            case "profile":
            case "property":
            case "room":
                return imageMimes;
            case "proof":
                return [...imageMimes, ...docMimes];
            default:
                return [];
        }
    }
    // Comprehensive validation
    validateFile(file, type) {
        const errors = [];
        // Size validation
        const sizeValidation = this.validateFileSize(file.buffer, type);
        if (!sizeValidation.isValid && sizeValidation.error) {
            errors.push(sizeValidation.error);
        }
        // Extension validation
        const typeValidation = this.validateFileType(file.originalname, type);
        if (!typeValidation.isValid && typeValidation.error) {
            errors.push(typeValidation.error);
        }
        // MIME type validation
        const mimeValidation = this.validateMimeType(file.mimetype, type);
        if (!mimeValidation.isValid && mimeValidation.error) {
            errors.push(mimeValidation.error);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    // Legacy method for backward compatibility
    isValidFileType(filename, type) {
        const validation = this.validateFileType(filename, type);
        return validation.isValid;
    }
}
exports.default = new FileValidationService();
