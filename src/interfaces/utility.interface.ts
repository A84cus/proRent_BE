/**
 * Utility Service Interface definitions
 * Contains all types related to utility service operations
 */

export interface TestEmailData {
  to: string;
  subject: string;
  type: "verification" | "reset" | "welcome" | "custom";
  customHtml?: string;
}

export interface ResendEmailData {
  email: string;
  type: "verification" | "reset";
}

export interface UtilityTestEmailResult {
  to: string;
  type: string;
  sentAt: string;
  message: string;
}

export interface UtilityResendEmailResult {
  email: string;
  type: string;
  sentAt: string;
  message: string;
}

export interface UtilityServiceResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export interface SystemInfoData {
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  features: string[];
}

export interface ServiceStatusData {
  service: string;
  status: "operational" | "degraded" | "down";
  lastChecked: string;
  details?: any;
}
