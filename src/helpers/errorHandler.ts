import { Response } from "express";
import { z } from "zod";
import multer from "multer";
import logger from "../utils/logger";

/**
 * Centralized error handling helper function
 * @param res - Express Response object
 * @param error - Error object (can be ZodError, Error, or any)
 * @param context - Context string for logging purposes
 * @returns Response with appropriate error status and message
 */
export const handleError = (res: Response, error: any, context: string) => {
  logger.error(`${context} error:`, error);

  if (error instanceof z.ZodError) {
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

/**
 * Handle authentication specific errors (401 for login errors)
 * @param res - Express Response object
 * @param error - Error object
 * @param context - Context string for logging purposes
 * @returns Response with appropriate auth error status and message
 */
export const handleAuthError = (res: Response, error: any, context: string) => {
  logger.error(`${context} error:`, error);

  if (error instanceof z.ZodError) {
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

/**
 * Handle file upload specific errors (including MulterError)
 * @param res - Express Response object
 * @param error - Error object
 * @param context - Context string for logging purposes
 * @returns Response with appropriate upload error status and message
 */
export const handleUploadError = (
  res: Response,
  error: any,
  context: string
) => {
  logger.error(`${context} error:`, error);

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }

  if (error instanceof multer.MulterError) {
    let message = "File upload error";
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 10MB.";
    } else if (error.code === "LIMIT_FILE_COUNT") {
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
