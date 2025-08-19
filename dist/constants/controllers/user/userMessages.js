"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_SUCCESS_MESSAGES = exports.USER_ERROR_MESSAGES = void 0;
// User Management Error Messages
exports.USER_ERROR_MESSAGES = {
    // User validation errors
    USER_NOT_FOUND: "User not found",
    USER_ID_REQUIRED: "User ID is required",
    USER_VALIDATION_FAILED: "User validation failed",
    INVALID_USER_DATA: "Invalid user data",
    // Profile errors
    PROFILE_UPDATE_FAILED: "Profile update failed",
    PROFILE_NOT_FOUND: "User profile not found",
    AVATAR_UPDATE_FAILED: "Avatar update failed",
    // Permission errors
    UNAUTHORIZED_ACCESS: "Unauthorized access",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
    ACCESS_DENIED: "Access denied",
    FORBIDDEN_OPERATION: "Forbidden operation",
    // Account errors
    ACCOUNT_SUSPENDED: "Account has been suspended",
    ACCOUNT_DISABLED: "Account is disabled",
    ACCOUNT_LOCKED: "Account is temporarily locked",
    ACCOUNT_EXPIRED: "Account has expired",
    // Data errors
    INVALID_USER_ROLE: "Invalid user role",
    USER_ALREADY_EXISTS: "User already exists",
    EMAIL_ALREADY_TAKEN: "Email is already taken",
    PHONE_ALREADY_TAKEN: "Phone number is already taken",
    // Authentication errors
    AUTHENTICATION_REQUIRED: "Authentication required",
    INVALID_CREDENTIALS: "Invalid credentials",
    SESSION_EXPIRED: "Session has expired",
    // Operation errors
    OPERATION_NOT_ALLOWED: "Operation not allowed for this user",
    DATA_PRIVACY_VIOLATION: "Data privacy violation",
    TERMS_NOT_ACCEPTED: "Terms and conditions not accepted",
};
// User Management Success Messages
exports.USER_SUCCESS_MESSAGES = {
    // Profile operations success
    PROFILE_RETRIEVED: "User profile retrieved successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    AVATAR_UPDATED: "Avatar updated successfully",
    // Authentication operations success
    PASSWORD_CHANGED: "Password changed successfully",
    // Email operations success
    EMAIL_VERIFICATION_SENT: "Verification email sent to new email address. Please check your email to verify your new address.",
    // User operations success
    USER_CREATED: "User created successfully",
    USER_DELETED: "User deleted successfully",
};
