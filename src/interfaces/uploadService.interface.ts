/**
 * Upload Service Interface definitions
 * Contains all types related to upload service operations
 */

import { FileType } from "./upload.interface";

export interface UploadFileData {
  buffer: Buffer;
  originalname: string;
  type: FileType;
  alt?: string;
  userId?: string;
}

export interface UploadResponse {
  id: string;
  url: string;
  publicId: string;
  type: FileType;
  alt: string;
  sizeKB: number;
  format: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  userId?: string;
  cloudinaryInfo: {
    id: string;
    createdAt: string;
  };
}

export interface FileUploadOptions {
  allowedTypes?: FileType[];
  maxSizeKB?: number;
  generateThumbnail?: boolean;
  compression?: {
    quality?: number;
    format?: string;
  };
}

export interface FileDeleteData {
  fileId: string;
  userId?: string;
}

export interface BulkUploadData {
  files: UploadFileData[];
  type: FileType;
  userId?: string;
}
