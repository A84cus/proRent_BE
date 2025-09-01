import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";
import {
  AvailabilityItem,
  AvailabilityValidationResult,
  MonthValidationResult,
  RoomTypeIdValidationResult,
  DateValidationResult,
} from "../../interfaces/property";

class AvailabilityValidationHelper {
  /**
   * Validate room type ID parameter
   */
  static validateRoomTypeId(id: string): RoomTypeIdValidationResult {
    if (!id) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.ROOM_TYPE_ID_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * @deprecated Use validateRoomTypeId instead
   */
  static validateRoomId = this.validateRoomTypeId;

  /**
   * Validate availability array for bulk operations
   */
  static validateAvailabilityArray(
    availability: any
  ): AvailabilityValidationResult {
    if (!availability || !Array.isArray(availability)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.AVAILABILITY_ARRAY_REQUIRED,
      };
    }

    if (availability.length === 0) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.AVAILABILITY_ARRAY_CANNOT_BE_EMPTY,
      };
    }

    // Validate each availability item
    for (let i = 0; i < availability.length; i++) {
      const item = availability[i];

      if (!item || typeof item !== "object") {
        return {
          isValid: false,
          error: `${PROPERTY_ERROR_MESSAGES.AVAILABILITY_ITEM_MUST_BE_OBJECT} at index ${i}`,
        };
      }

      if (!item.date || typeof item.date !== "string") {
        return {
          isValid: false,
          error: `${PROPERTY_ERROR_MESSAGES.DATE_REQUIRED_AT_INDEX} at index ${i}`,
        };
      }

      if (typeof item.isAvailable !== "boolean") {
        return {
          isValid: false,
          error: `${PROPERTY_ERROR_MESSAGES.IS_AVAILABLE_REQUIRED_AT_INDEX} at index ${i}`,
        };
      }

      // Validate date format
      const dateValidation = this.validateDateFormat(item.date);
      if (!dateValidation.isValid) {
        return {
          isValid: false,
          error: `${dateValidation.error} at index ${i}`,
        };
      }
    }

    return {
      isValid: true,
      data: availability as AvailabilityItem[],
    };
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static validateDateFormat(date: string): DateValidationResult {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT_AT_INDEX,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate month parameter for monthly availability
   */
  static validateMonthParameter(month: any): MonthValidationResult {
    if (!month || typeof month !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.MONTH_PARAMETER_REQUIRED,
      };
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.INVALID_MONTH_FORMAT,
      };
    }

    // Parse year and month
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // Validate year and month ranges
    if (year < 2000 || year > 2100) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.YEAR_RANGE_VALIDATION,
      };
    }

    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.MONTH_RANGE_VALIDATION,
      };
    }

    return {
      isValid: true,
      year,
      month: monthNum,
    };
  }
}

export default AvailabilityValidationHelper;
