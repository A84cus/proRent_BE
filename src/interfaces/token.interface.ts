/**
 * Token Service Interface definitions
 * Contains all types related to token operations
 */

import { Role } from "./auth.interface";

export interface TokenGenerationResult {
  token: string;
  hashedToken: string;
  expires: Date;
}

export interface JWTPayload {
  userId: string;
  role: Role;
}

export interface TokenVerificationResult {
  userId: string;
  role: Role;
}

export interface TokenOptions {
  expiresIn?: string;
  audience?: string;
  issuer?: string;
}
