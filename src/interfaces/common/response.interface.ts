/**
 * API Response Interface definitions
 * Contains all types related to API response formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationData;
  meta?: ResponseMeta;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  version?: string;
  processingTime?: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  meta?: ResponseMeta;
}
