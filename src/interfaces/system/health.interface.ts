/**
 * System Health Interface definitions
 * Contains all types related to system health monitoring
 */

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  services: {
    database: "connected" | "disconnected";
    email: "connected" | "disconnected";
  };
  uptime: number;
  version: string;
}

export interface EmailStatus {
  emailServiceStatus: "connected" | "disconnected";
  timestamp: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
}

export interface DatabaseStatus {
  databaseStatus: "connected" | "disconnected";
  timestamp: string;
  connectionString?: string;
  lastConnectionCheck: string;
}

export interface ServiceStatus {
  service: string;
  status: "online" | "offline" | "degraded";
  lastChecked: string;
  responseTime?: number;
}
