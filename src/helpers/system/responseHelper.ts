import { Response } from "express";
import { ApiResponse, PaginationData } from "../../interfaces";

class ResponseHelper {
  // Success response
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  // Error response
  static error(
    res: Response,
    message: string,
    errors?: string[],
    statusCode: number = 400
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  // Paginated response
  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: ApiResponse["pagination"],
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
    };
    return res.status(statusCode).json(response);
  }

  // File upload success response
  static uploadSuccess(res: Response, fileData: any): Response {
    return this.success(res, "File uploaded successfully", fileData, 200);
  }

  // File deletion success response
  static deleteSuccess(res: Response): Response {
    return this.success(res, "File deleted successfully", undefined, 200);
  }

  // Validation error response
  static validationError(res: Response, errors: string[]): Response {
    return this.error(res, "Validation failed", errors, 400);
  }

  // Not found response
  static notFound(res: Response, resource: string = "Resource"): Response {
    return this.error(res, `${resource} not found`, undefined, 404);
  }

  // Unauthorized response
  static unauthorized(
    res: Response,
    message: string = "Unauthorized"
  ): Response {
    return this.error(res, message, undefined, 401);
  }

  // Server error response
  static serverError(
    res: Response,
    message: string = "Internal server error"
  ): Response {
    return this.error(res, message, undefined, 500);
  }

  // Bad request response
  static badRequest(
    res: Response,
    message: string,
    errors?: string[]
  ): Response {
    return this.error(res, message, errors, 400);
  }
}

export default ResponseHelper;
