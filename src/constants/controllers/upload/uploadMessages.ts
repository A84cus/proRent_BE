// Upload/File Management Error Messages
export const UPLOAD_ERROR_MESSAGES = {
  // File validation errors
  FILE_REQUIRED: "File is required",
  FILE_ID_REQUIRED: "File ID is required",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  FILE_TOO_SMALL: "File size is too small",

  // File not found errors
  FILE_NOT_FOUND: "File not found",
  IMAGE_NOT_FOUND: "Image not found",
  DOCUMENT_NOT_FOUND: "Document not found",

  // Upload errors
  UPLOAD_FAILED: "File upload failed",
  UPLOAD_CANCELLED: "File upload was cancelled",
  UPLOAD_TIMEOUT: "File upload timeout",
  STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded",

  // Download errors
  DOWNLOAD_FAILED: "File download failed",
  FILE_CORRUPTED: "File appears to be corrupted",

  // Delete errors
  DELETE_FAILED: "File deletion failed",
  DELETE_UNAUTHORIZED: "Unauthorized to delete this file",
  FILE_IN_USE: "File is currently in use and cannot be deleted",

  // Authorization errors
  UNAUTHORIZED_ACCESS: "Unauthorized access to file",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this operation",
  OWNER_VERIFICATION_FAILED: "File owner verification failed",

  // Processing errors
  IMAGE_PROCESSING_FAILED: "Image processing failed",
  FILE_CONVERSION_FAILED: "File conversion failed",
  THUMBNAIL_GENERATION_FAILED: "Thumbnail generation failed",

  // Server errors
  INTERNAL_SERVER_ERROR: "Internal server error during file operation",
  STORAGE_SERVICE_UNAVAILABLE: "Storage service is temporarily unavailable",
  CLOUDINARY_ERROR: "Cloud storage service error",

  // General errors
  INVALID_OPERATION: "Invalid file operation",
  OPERATION_NOT_SUPPORTED: "Operation not supported for this file type",
} as const;

// Upload/File Management Success Messages
export const UPLOAD_SUCCESS_MESSAGES = {
  // Operation success
  UPLOAD_SUCCESS: "File uploaded successfully",
  DELETE_SUCCESS: "File deleted successfully",

  // Data retrieval success
  FILE_INFO_RETRIEVED: "File information retrieved successfully",
  FILES_LISTED: "Files listed successfully",
} as const;

export type UploadErrorMessage =
  (typeof UPLOAD_ERROR_MESSAGES)[keyof typeof UPLOAD_ERROR_MESSAGES];

export type UploadSuccessMessage =
  (typeof UPLOAD_SUCCESS_MESSAGES)[keyof typeof UPLOAD_SUCCESS_MESSAGES];
