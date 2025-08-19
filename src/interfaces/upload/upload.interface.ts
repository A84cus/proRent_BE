/**
 * File Upload Interface definitions
 * Contains all types related to file upload operations
 */

export type FileType = "profile" | "property" | "room" | "proof";

export interface UploadResult {
  id: string;
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  resource_type?: "image" | "video" | "raw" | "auto";
  allowed_formats?: string[];
  max_file_size?: number; // in bytes
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface FileValidationRules {
  allowedTypes: string[];
  maxSize: number;
  minSize?: number;
  maxDimensions?: {
    width: number;
    height: number;
  };
}
