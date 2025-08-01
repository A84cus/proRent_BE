/**
 * Validation Interface definitions
 * Contains all types related to validation operations
 */

import { ZodSchema, ZodError } from "zod";

export interface ValidationSchema<T = any> {
  schema: ZodSchema<T>;
  name: string;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: (string | number)[];
  message: string;
  code: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  validatedData?: any;
  errors: string[];
}

export interface FormValidationState {
  isValidating: boolean;
  hasErrors: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
