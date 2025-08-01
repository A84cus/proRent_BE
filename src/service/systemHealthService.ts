import emailService from "./emailService";
import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";
import { HealthStatus, EmailStatus } from "../interfaces/health.interface";

const prisma = new PrismaClient();

class SystemHealthService {
  // Check database connection
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.user.count();
      return true;
    } catch (error) {
      logger.error("Database connection failed:", error);
      return false;
    }
  }

  // Check email service connection
  async checkEmailConnection(): Promise<boolean> {
    try {
      return await emailService.testConnection();
    } catch (error) {
      logger.error("Email service connection failed:", error);
      return false;
    }
  }

  // Get comprehensive health status
  async getHealthStatus(): Promise<HealthStatus> {
    const [databaseStatus, emailStatus] = await Promise.all([
      this.checkDatabaseConnection(),
      this.checkEmailConnection(),
    ]);

    const isHealthy = databaseStatus && emailStatus;

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus ? "connected" : "disconnected",
        email: emailStatus ? "connected" : "disconnected",
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  // Get email service status
  async getEmailStatus(): Promise<EmailStatus> {
    const isConnected = await this.checkEmailConnection();

    return {
      emailServiceStatus: isConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      smtpHost: process.env.SMTP_HOST || "not configured",
      smtpPort: process.env.SMTP_PORT || "not configured",
      smtpUser: process.env.SMTP_USER ? "configured" : "not configured",
    };
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "ProRent Backend API",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      features: {
        authentication: "enabled",
        fileUpload: "enabled",
        emailService: "enabled",
        utilities: "enabled",
      },
      endpoints: {
        auth: "/api/auth",
        upload: "/api/upload",
        utility: "/api/utility",
      },
    };
  }
}

export default new SystemHealthService();
