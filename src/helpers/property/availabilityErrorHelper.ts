import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";

export interface ErrorMapping {
  [key: string]: {
    message: string;
    statusCode: number;
  };
}

class AvailabilityErrorHelper {
  /**
   * Get error mappings for bulk availability operations
   */
  static getBulkAvailabilityErrorMappings(): ErrorMapping {
    return {
      "Room not found": {
        message: PROPERTY_ERROR_MESSAGES.ROOM_NOT_FOUND,
        statusCode: 404,
      },
      "You don't have permission to manage this room's availability": {
        message: PROPERTY_ERROR_MESSAGES.NO_PERMISSION_MANAGE_ROOM_AVAILABILITY,
        statusCode: 403,
      },
      "Cannot set unavailable dates that have active reservations": {
        message:
          PROPERTY_ERROR_MESSAGES.CANNOT_SET_UNAVAILABLE_DATES_WITH_RESERVATIONS,
        statusCode: 409,
      },
      "Failed to set room availability": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_SET_ROOM_AVAILABILITY,
        statusCode: 500,
      },
    };
  }

  /**
   * Get error mappings for monthly availability operations
   */
  static getMonthlyAvailabilityErrorMappings(): ErrorMapping {
    return {
      "Room not found": {
        message: PROPERTY_ERROR_MESSAGES.ROOM_NOT_FOUND,
        statusCode: 404,
      },
      "You don't have permission to view this room's availability": {
        message: PROPERTY_ERROR_MESSAGES.NO_PERMISSION_VIEW_ROOM_AVAILABILITY,
        statusCode: 403,
      },
      "Failed to get room availability": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_ROOM_AVAILABILITY,
        statusCode: 500,
      },
    };
  }
}

export default AvailabilityErrorHelper;
