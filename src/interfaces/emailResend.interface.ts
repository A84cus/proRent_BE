/**
 * Email Resend Interface definitions
 * Contains all types related to email resend operations
 */

export interface ResendEmailOptions {
  email: string;
  type: "verification" | "reset";
}

export interface ResendEmailResult {
  email: string;
  type: string;
  sentAt: string;
  message: string;
}

export interface EmailResendData {
  userEmail: string;
  emailType: "verification" | "reset";
  userId?: string;
}

export interface EmailResendResponse {
  success: boolean;
  messageId?: string;
  email: string;
  type: string;
  timestamp: string;
  error?: string;
}
