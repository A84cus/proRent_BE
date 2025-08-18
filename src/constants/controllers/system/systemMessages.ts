// System/Utility Error Messages
export const SYSTEM_ERROR_MESSAGES = {
  // Health check errors
  HEALTH_CHECK_FAILED: "Health check failed",
  SERVICE_UNAVAILABLE: "Service is temporarily unavailable",
  DATABASE_CONNECTION_FAILED: "Database connection failed",

  // Email service errors
  EMAIL_SERVICE_ERROR: "Email service error",
  EMAIL_SEND_FAILED: "Failed to send email",
  EMAIL_TEMPLATE_ERROR: "Email template error",
  SMTP_CONNECTION_FAILED: "SMTP connection failed",

  // Email testing errors
  TEST_EMAIL_FAILED: "Test email failed",
  EMAIL_DELIVERY_FAILED: "Email delivery failed",
  EMAIL_QUEUE_FULL: "Email queue is full",

  // Email status errors
  EMAIL_STATUS_CHECK_FAILED: "Email status check failed",
  EMAIL_NOT_SENT: "Email was not sent",
  EMAIL_BOUNCED: "Email bounced",

  // Service info errors
  SERVICE_INFO_UNAVAILABLE: "Service information unavailable",
  CONFIGURATION_ERROR: "Service configuration error",

  // General system errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  SERVICE_TIMEOUT: "Service timeout",
  RESOURCE_NOT_AVAILABLE: "Resource not available",
  MAINTENANCE_MODE: "System is under maintenance",

  // Configuration errors
  MISSING_CONFIGURATION: "Missing required configuration",
  INVALID_CONFIGURATION: "Invalid configuration",
  ENVIRONMENT_ERROR: "Environment configuration error",

  // Third-party service errors
  THIRD_PARTY_SERVICE_ERROR: "Third-party service error",
  API_RATE_LIMIT_EXCEEDED: "API rate limit exceeded",
  EXTERNAL_SERVICE_UNAVAILABLE: "External service unavailable",

  // Operation errors
  OPERATION_FAILED: "Operation failed",
  OPERATION_CANCELLED: "Operation was cancelled",
} as const;

// System/Utility Success Messages
export const SYSTEM_SUCCESS_MESSAGES = {
  // Health check success
  HEALTH_CHECK_SUCCESS: "System is healthy",

  // Email operations success
  EMAIL_TEST_SUCCESS: "Test email sent successfully",
  EMAIL_RESEND_SUCCESS: "Email resent successfully",
  EMAIL_STATUS_SUCCESS: "Email status retrieved successfully",

  // Service operations success
  SERVICE_INFO_SUCCESS: "Service information retrieved successfully",
  OPERATION_COMPLETED: "Operation completed successfully",
} as const;

export type SystemErrorMessage =
  (typeof SYSTEM_ERROR_MESSAGES)[keyof typeof SYSTEM_ERROR_MESSAGES];

export type SystemSuccessMessage =
  (typeof SYSTEM_SUCCESS_MESSAGES)[keyof typeof SYSTEM_SUCCESS_MESSAGES];
