/**
 * Email Testing Interface definitions
 * Contains all types related to email testing operations
 */

export interface TestEmailOptions {
  to: string;
  subject: string;
  type: "verification" | "reset" | "welcome" | "custom";
  customHtml?: string;
}

export interface TestEmailResult {
  to: string;
  type: string;
  sentAt: string;
  message: string;
}

export interface EmailTestData {
  recipient: string;
  emailType: string;
  mockData?: any;
  testToken?: string;
}

export interface EmailTestResponse {
  success: boolean;
  messageId?: string;
  recipient: string;
  emailType: string;
  timestamp: string;
  error?: string;
}
