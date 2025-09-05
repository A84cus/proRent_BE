import { Request, Response } from "express";
import utilityService from "../../service/system/utilityService";
import responseHelper from "../../helpers/system/responseHelper";
import logger from "../../utils/system/logger";
import { handleError } from "../../helpers/system/errorHandler";
import { testEmailSchema, resendEmailSchema } from "../../validations";
import {
  SYSTEM_ERROR_MESSAGES,
  SYSTEM_SUCCESS_MESSAGES,
} from "../../constants/controllers/system";

class UtilityController {
  // POST /api/utility/test-email - Test email sending functionality
  async testEmail(req: Request, res: Response) {
    try {
      const validatedData = testEmailSchema.parse(req.body);
      const result = await utilityService.processTestEmail(validatedData);

      return responseHelper.success(res, result.message, {
        to: result.to,
        type: result.type,
        sentAt: result.sentAt,
      });
    } catch (error) {
      handleError(res, error, SYSTEM_ERROR_MESSAGES.TEST_EMAIL_FAILED);
    }
  }

  // POST /api/utility/resend-email - Resend verification or reset email for existing user
  async resendEmail(req: Request, res: Response) {
    try {
      const validatedData = resendEmailSchema.parse(req.body);
      const result = await utilityService.processResendEmail(validatedData);

      return responseHelper.success(res, result.message, {
        email: result.email,
        type: result.type,
        sentAt: result.sentAt,
      });
    } catch (error) {
      handleError(res, error, "Resend email");
    }
  }

  // GET /api/utility/email-status - Check email service status
  async checkEmailStatus(req: Request, res: Response) {
    try {
      const emailStatus = await utilityService.getEmailStatus();
      return responseHelper.success(
        res,
        SYSTEM_SUCCESS_MESSAGES.EMAIL_STATUS_SUCCESS,
        emailStatus
      );
    } catch (error) {
      handleError(res, error, "Email status check");
    }
  }

  // GET /api/utility/health - Health check endpoint
  async healthCheck(req: Request, res: Response) {
    try {
      const healthStatus = await utilityService.getHealthCheck();

      const statusCode = healthStatus.status === "healthy" ? 200 : 503;
      const message =
        healthStatus.status === "healthy"
          ? SYSTEM_SUCCESS_MESSAGES.HEALTH_CHECK_SUCCESS
          : "Service is unhealthy";

      return responseHelper.success(res, message, healthStatus, statusCode);
    } catch (error) {
      handleError(res, error, "Health check");
    }
  }

  // GET /api/utility/info - Get service information
  async getServiceInfo(req: Request, res: Response) {
    try {
      const serviceInfo = utilityService.getServiceInfo();
      return responseHelper.success(
        res,
        SYSTEM_SUCCESS_MESSAGES.SERVICE_INFO_SUCCESS,
        serviceInfo
      );
    } catch (error) {
      handleError(res, error, "Service info");
    }
  }
}

export default new UtilityController();
