// Central validation index - exports all validation schemas and functions
export * from "./auth/authValidation";
export * from "./user/userValidation";
export * from "./upload/uploadValidation";
export * from "./property/propertyValidation";
export * from "./reservation/reservationValidation";
export * from "./review/reviewValidation";

// Legacy exports for backward compatibility
export * from "./auth";
export * from "./system";
export * from "./reservation";
export * from "./upload";

// Common validation utilities
import { z } from "zod";

// Generic validation schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const sortingSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const timestampSchema = z.string().datetime("Invalid timestamp format");

// Generic validation functions
export function validatePagination(
  page?: number,
  limit?: number
): { page: number; limit: number; offset: number } {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(100, Math.max(1, limit || 10));
  const offset = (validatedPage - 1) * validatedLimit;

  return {
    page: validatedPage,
    limit: validatedLimit,
    offset,
  };
}

export function validateAndSanitizeString(
  value: any,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): { isValid: boolean; value?: string; error?: string } {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (typeof value !== "string") {
    return {
      isValid: false,
      error: `${fieldName} must be a string`,
    };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return {
    isValid: true,
    value: trimmedValue,
  };
}

export function validateEnum<T extends string>(
  value: any,
  enumValues: T[],
  fieldName: string
): { isValid: boolean; value?: T; error?: string } {
  if (!value) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (!enumValues.includes(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${enumValues.join(", ")}`,
    };
  }

  return {
    isValid: true,
    value: value as T,
  };
}

export function validateArray<T>(
  value: any,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 100
): { isValid: boolean; value?: T[]; error?: string } {
  if (!Array.isArray(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be an array`,
    };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least ${minLength} items`,
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not contain more than ${maxLength} items`,
    };
  }

  return {
    isValid: true,
    value: value as T[],
  };
}
