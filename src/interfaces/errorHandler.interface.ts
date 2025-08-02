/**
 * Error Handler Interface definitions
 * Contains all types related to error handling operations
 */

import { Response } from "express";

export interface ErrorContext {
  operation: string;
  userId?: string;
  requestId?: string;
  timestamp: string;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  context?: ErrorContext;
}

export interface HandlerErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

export interface ValidationErrorDetail {
  field: string;
  value: any;
  message: string;
  code: string;
}

export interface ErrorHandlerOptions {
  logError?: boolean;
  includeStackTrace?: boolean;
  customMessage?: string;
}
