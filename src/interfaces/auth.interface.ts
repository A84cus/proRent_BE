/**
 * Authentication Interface definitions
 * Contains all types related to authentication and authorization
 */

<<<<<<< HEAD
export type Role = "USER" | "OWNER";
=======
export type Role = 'USER' | 'OWNER';
>>>>>>> e5aee09f905eadbba2f45a60016b8ef41b7ffeaa

export interface RegisterUserData {
   email: string;
   role: Role;
   password?: string;
   socialLogin?: 'GOOGLE' | 'FACEBOOK' | 'TWITTER' | 'NONE';
}

export interface RegisterOwnerData {
  email: string;
  password: string;
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
