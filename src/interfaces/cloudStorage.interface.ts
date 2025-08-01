/**
 * Cloud Storage Interface definitions
 * Contains all types related to cloud storage operations
 */

export interface CloudUploadOptions {
  folder: string;
  resource_type?: string;
  transformation?: any[];
}

export interface CloudUploadResult {
  id: string;
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
}

export interface CloudDeleteOptions {
  publicId: string;
  resource_type?: string;
}

export interface CloudDeleteResult {
  result: string;
  publicId: string;
}
