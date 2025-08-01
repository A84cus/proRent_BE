import { Request, Response } from "express";
import utilityService from "../service/utilityService";
import responseHelper from "../helpers/responseHelper";
import logger from "../utils/logger";
import { handleError } from "../helpers/errorHandler";
import {
  testEmailSchema,
  resendEmailSchema,
} from "../validations/utilityValidation";

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
      handleError(res, error, "Test email");
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
        "Email status retrieved successfully",
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
          ? "Service is healthy"
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
        "Service information retrieved successfully",
        serviceInfo
      );
    } catch (error) {
      handleError(res, error, "Service info");
    }
  }
}

export default new UtilityController();
