export interface UserValidationResult {
  isValid: boolean;
  userId?: string;
  error?: string;
}

export interface ProfileUpdateData {
  sanitizedData: any;
  existingUser: any;
}

export interface UserPasswordChangeData {
  currentPassword: string;
  newPassword: string;
  user: any;
}

export interface EmailChangeData {
  newEmail: string;
  user: any;
}
