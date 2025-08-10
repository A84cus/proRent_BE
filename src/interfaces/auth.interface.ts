/**
 * Authentication Interface definitions
 * Contains all types related to authentication and authorization
 */

export type Role = 'USER' | 'OWNER';

export interface RegisterUserData {
   email: string;
   role: Role;
   password?: string;
   socialLogin?: 'GOOGLE' | 'FACEBOOK' | 'TWITTER' | 'NONE';
}

export interface LoginData {
   email: string;
   password?: string;
   socialLogin?: 'GOOGLE' | 'FACEBOOK' | 'TWITTER' | 'NONE';
}

export interface ResetPasswordData {
   token: string;
   newPassword: string;
}

export interface AuthResponse {
   user: {
      id: string;
      email: string;
      role: Role;
      isVerified: boolean;
   };
   token: string;
}

export interface VerificationResult {
   success: boolean;
   message: string;
   user?: {
      id: string;
      email: string;
      role: Role;
   };
}
