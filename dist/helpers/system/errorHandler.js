"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.handleAuthError = exports.handleError = void 0;
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
/**
 * Centralized error handling helper function
 * @param res - Express Response object
 * @param error - Error object (can be ZodError, Error, or any)
 * @param context - Context string for logging purposes
 * @returns Response with appropriate error status and message
 */
const handleError = (res, error, context) => {
    logger_1.default.error(`${context} error:`, error);
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues,
        });
    }
    if (error instanceof Error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.handleError = handleError;
/**
 * Handle authentication specific errors (401 for login errors)
 * @param res - Express Response object
 * @param error - Error object
 * @param context - Context string for logging purposes
 * @returns Response with appropriate auth error status and message
 */
const handleAuthError = (res, error, context) => {
    logger_1.default.error(`${context} error:`, error);
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues,
        });
    }
    if (error instanceof Error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.handleAuthError = handleAuthError;
/**
 * Handle file upload specific errors (including MulterError)
 * @param res - Express Response object
 * @param error - Error object
 * @param context - Context string for logging purposes
 * @returns Response with appropriate upload error status and message
 */
const handleUploadError = (res, error, context) => {
    logger_1.default.error(`${context} error:`, error);
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues,
        });
    }
    if (error instanceof multer_1.default.MulterError) {
        let message = "File upload error";
        if (error.code === "LIMIT_FILE_SIZE") {
            message = "File too large. Maximum size is 10MB.";
        }
        else if (error.code === "LIMIT_FILE_COUNT") {
            message = "Too many files. Upload one file at a time.";
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }
    if (error instanceof Error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error during file upload",
    });
};
exports.handleUploadError = handleUploadError;
