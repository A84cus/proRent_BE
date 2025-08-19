import {
  ROOM_ERROR_MESSAGES,
  PROPERTY_ERROR_MESSAGES,
} from "../../constants/controllers/property";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

class RoomErrorHelper {
  /**
   * Maps different types of errors for room operations
   */
  static mapError(
    error: any,
    context: string
  ): { status: number; message: string } {
    // Handle authentication errors
    if (error.message === PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED) {
      return { status: 401, message: error.message };
    }

    // Handle room not found errors
    if (
      error.message ===
      ROOM_ERROR_MESSAGES[
        "Room not found or you don't have permission to update it"
      ].message
    ) {
      return { status: 404, message: error.message };
    }

    // Handle property not found errors
    if (error.message === PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND) {
      return { status: 404, message: error.message };
    }

    // Handle validation errors
    if (
      error.message === ROOM_ERROR_MESSAGES["Validation failed"].message ||
      error.message ===
        ROOM_ERROR_MESSAGES["No valid data provided for update"].message ||
      error.message === PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED
    ) {
      return { status: 400, message: error.message };
    }

    // Handle permission errors
    if (
      error.message ===
        ROOM_ERROR_MESSAGES[
          "Property not found or you don't have permission to access it"
        ].message ||
      error.message ===
        ROOM_ERROR_MESSAGES[
          "Property not found or you don't have permission to create rooms"
        ].message ||
      error.message ===
        ROOM_ERROR_MESSAGES[
          "Room not found or you don't have permission to update it"
        ].message ||
      error.message ===
        ROOM_ERROR_MESSAGES[
          "Room not found or you don't have permission to delete it"
        ].message
    ) {
      return { status: 403, message: error.message };
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
      case "P2002": // Unique constraint violation
        return {
          status: 409,
          message: "A room with this information already exists",
        };
      case "P2025": // Record not found
        if (context === "property") {
          return {
            status: 404,
            message: PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
          };
        }
        return {
          status: 404,
          message:
            ROOM_ERROR_MESSAGES[
              "Room not found or you don't have permission to update it"
            ].message,
        };
      case "P2003": // Foreign key constraint violation
        return {
          status: 400,
          message: "Invalid reference to related data",
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
      case "getRoomsByProperty":
        return {
          status: 500,
          message: ROOM_ERROR_MESSAGES["Failed to fetch rooms"].message,
        };
      case "createRoom":
        return {
          status: 500,
          message: ROOM_ERROR_MESSAGES["Failed to create room"].message,
        };
      case "updateRoom":
        return {
          status: 500,
          message: ROOM_ERROR_MESSAGES["Failed to update room"].message,
        };
      case "deleteRoom":
        return {
          status: 500,
          message: ROOM_ERROR_MESSAGES["Failed to delete room"].message,
        };
      default:
        return {
          status: 500,
          message: PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
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
    message: string = ROOM_ERROR_MESSAGES[
      "Room not found or you don't have permission to update it"
    ].message
  ): { status: number; message: string } {
    return { status: 404, message };
  }

  static createUnauthorizedError(
    message: string = PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED
  ): { status: number; message: string } {
    return { status: 401, message };
  }

  static createForbiddenError(
    message: string = ROOM_ERROR_MESSAGES[
      "Property not found or you don't have permission to access it"
    ].message
  ): { status: number; message: string } {
    return { status: 403, message };
  }

  static createInternalError(
    message: string = PROPERTY_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  ): { status: number; message: string } {
    return { status: 500, message };
  }
}

export default RoomErrorHelper;
