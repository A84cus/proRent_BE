import { PUBLIC_PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

class PublicPropertyErrorHelper {
  /**
   * Maps different types of errors for public property operations
   */
  static mapError(
    error: any,
    context: string
  ): { status: number; message: string } {
    // Handle property not found errors
    if (error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
      return { status: 404, message: error.message };
    }

    // Handle validation errors
    if (
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MIN_PRICE ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MAX_PRICE ||
      error.message ===
        PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_PRICE_GREATER_THAN_MAX ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_TOO_LOW ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.MAX_ROOMS_TOO_LOW ||
      error.message ===
        PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_GREATER_THAN_MAX ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_BY ||
      error.message ===
        PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_ORDER_VALUE ||
      error.message ===
        PUBLIC_PROPERTY_ERROR_MESSAGES.PAGE_MUST_BE_AT_LEAST_ONE ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_LIMIT_RANGE ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT ||
      error.message === PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_VALUES ||
      error.message ===
        PUBLIC_PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE
    ) {
      return { status: 400, message: error.message };
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(error, context);
    }

    // Default error handling based on context
    return this.getDefaultErrorByContext(context);
  }

  /**
   * Handles Prisma-specific errors
   */
  private static handlePrismaError(
    error: PrismaClientKnownRequestError,
    context: string
  ): { status: number; message: string } {
    switch (error.code) {
      case "P2025": // Record not found
        return {
          status: 404,
          message: PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      default:
        return this.getDefaultErrorByContext(context);
    }
  }

  /**
   * Returns default error messages based on operation context
   */
  private static getDefaultErrorByContext(context: string): {
    status: number;
    message: string;
  } {
    switch (context) {
      case "search":
        return {
          status: 500,
          message: PUBLIC_PROPERTY_ERROR_MESSAGES.SEARCH_FAILED,
        };
      case "details":
        return {
          status: 500,
          message:
            PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_DETAILS,
        };
      case "calendar":
        return {
          status: 500,
          message:
            PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_CALENDAR_PRICING,
        };
      case "rooms":
        return {
          status: 500,
          message: PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_ROOMS,
        };
      default:
        return {
          status: 500,
          message: PUBLIC_PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        };
    }
  }

  /**
   * Helper methods for specific error scenarios
   */
  static createValidationError(message: string): {
    status: number;
    message: string;
  } {
    return { status: 400, message };
  }

  static createNotFoundError(
    message: string = PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND
  ): { status: number; message: string } {
    return { status: 404, message };
  }

  static createInternalError(
    message: string = PUBLIC_PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  ): { status: number; message: string } {
    return { status: 500, message };
  }
}

export default PublicPropertyErrorHelper;
