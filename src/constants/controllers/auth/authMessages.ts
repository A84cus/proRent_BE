// Authentication Error Messages
export const AUTH_ERROR_MESSAGES = {
  // User registration errors
  USER_REGISTRATION_FAILED: "User registration failed",
  OWNER_REGISTRATION_FAILED: "Owner registration failed",
  EMAIL_ALREADY_EXISTS: "Email already exists",

  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_NOT_VERIFIED: "Please verify your email before logging in",
  ACCOUNT_DISABLED: "Your account has been disabled",

  // Email verification errors
  EMAIL_VERIFICATION_FAILED: "Email verification failed",
  INVALID_VERIFICATION_TOKEN: "Invalid or expired verification token",
  EMAIL_ALREADY_VERIFIED: "Email is already verified",

  // Password reset errors
  PASSWORD_RESET_FAILED: "Password reset failed",
  INVALID_RESET_TOKEN: "Invalid or expired reset token",
  PASSWORD_RESET_TOKEN_EXPIRED: "Password reset token has expired",

  // Token errors
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_REQUIRED: "Authentication token is required",
  TOKEN_EXPIRED: "Token has expired",
  ACCESS_DENIED: "Access denied. Insufficient permissions",
  UNAUTHORIZED: "Unauthorized",

  // Validation errors
  VALIDATION_FAILED: "Validation failed",
  USER_VALIDATION_FAILED: "User validation failed",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  PASSWORD_TOO_WEAK: "Password must be at least 8 characters long",
  REQUIRED_FIELDS_MISSING: "Required fields are missing",
} as const;

// Authentication Success Messages
export const AUTH_SUCCESS_MESSAGES = {
  // Registration success
  REGISTRATION_SUCCESS:
    "Registration successful. Please check your email for verification.",
  OWNER_REGISTRATION_SUCCESS:
    "Owner registration successful. Please check your email for verification.",

  // Email verification success
  EMAIL_VERIFICATION_SUCCESS: "Email verified successfully",
  VERIFICATION_EMAIL_SENT: "Verification email sent successfully",

  // Authentication success
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",

  // Password reset success
  PASSWORD_RESET_EMAIL_SENT:
    "If an account with that email exists, a password reset link has been sent.",
  PASSWORD_RESET_SUCCESS:
    "Password reset successful. You can now login with your new password.",
} as const;

export type AuthErrorMessage =
  (typeof AUTH_ERROR_MESSAGES)[keyof typeof AUTH_ERROR_MESSAGES];

export type AuthSuccessMessage =
  (typeof AUTH_SUCCESS_MESSAGES)[keyof typeof AUTH_SUCCESS_MESSAGES];
