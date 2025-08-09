<<<<<<< HEAD
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
=======
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
>>>>>>> e5aee09f905eadbba2f45a60016b8ef41b7ffeaa
