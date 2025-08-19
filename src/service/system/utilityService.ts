import emailTestingService from "../email/emailTestingService";
import emailResendService from "../email/emailResendService";
import systemHealthService from "./systemHealthService";
import logger from "../../utils/system/logger";
import {
  TestEmailData,
  ResendEmailData,
  UtilityTestEmailResult,
  UtilityResendEmailResult,
} from "../../interfaces";

class UtilityService {
  // Process test email
  async processTestEmail(data: TestEmailData): Promise<UtilityTestEmailResult> {
    const { to, type } = data;

    const message = await emailTestingService.processTestEmail(data);

    logger.info(`Test email sent to ${to} - Type: ${type}`);

    return {
      to,
      type,
      sentAt: new Date().toISOString(),
      message,
    };
  }

  // Process resend email
  async processResendEmail(
    data: ResendEmailData
  ): Promise<UtilityResendEmailResult> {
    const { email, type } = data;

    const message = await emailResendService.processResendEmail(data);

    logger.info(`Email resent to ${email} - Type: ${type}`);

    return {
      email,
      type,
      sentAt: new Date().toISOString(),
      message,
    };
  }

  // Get email status
  async getEmailStatus() {
    return systemHealthService.getEmailStatus();
  }

  // Get health check
  async getHealthCheck() {
    return systemHealthService.getHealthStatus();
  }

  // Get service info
  getServiceInfo() {
    return systemHealthService.getServiceInfo();
  }
}

export default new UtilityService();
