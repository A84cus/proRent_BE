/**
 * Middleware Interface definitions
 * Contains all types related to middleware operations
 */

import { Request, Response, NextFunction } from "express";
import { Role } from "./auth.interface";

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface MiddlewareFunction {
  (req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: Role[];
}

export interface MiddlewareValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface MiddlewareValidationResult {
  isValid: boolean;
  errors: MiddlewareValidationError[];
  data?: any;
}
