import { Request, Response } from "express";
import logger from "../utils/system/logger";
import ResponseHelper from "../helpers/system/responseHelper";
import { validateUserId } from "../validations/user/userValidation";
import { PROPERTY_ERROR_MESSAGES } from "../constants/controllers/property";

abstract class BaseController {
  // Common method untuk validasi user authentication
  protected validateUser(req: Request): {
    isValid: boolean;
    userId?: string;
    error?: string;
  } {
    return validateUserId(req);
  }

  // Common error handler
  protected handleError(
    res: Response,
    error: any,
    operation: string,
    specificErrors: Record<string, { message: string; statusCode: number }> = {}
  ) {
    logger.error(`Error in ${operation}:`, error);

    // Handle specific known errors
    if (error.message && specificErrors[error.message]) {
      const specificError = specificErrors[error.message];
      return ResponseHelper.error(
        res,
        specificError.message,
        undefined,
        specificError.statusCode
      );
    }

    // Default error
    return ResponseHelper.error(
      res,
      PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      undefined,
      500
    );
  }

  // Common authentication error
  protected handleAuthError(res: Response, error: string) {
    return ResponseHelper.error(res, error, undefined, 401);
  }

  // Common validation error
  protected handleValidationError(res: Response, error: string | string[]) {
    const message = Array.isArray(error) ? error[0] : error;
    return ResponseHelper.error(
      res,
      message,
      Array.isArray(error) ? error : undefined,
      400
    );
  }

  // Common not found error
  protected handleNotFoundError(res: Response, resource: string = "Resource") {
    return ResponseHelper.error(res, `${resource} not found`, undefined, 404);
  }

  // Common success response
  protected handleSuccess(res: Response, message: string, data?: any) {
    return ResponseHelper.success(res, message, data);
  }
}

export default BaseController;
