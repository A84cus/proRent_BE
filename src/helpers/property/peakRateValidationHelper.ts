import { RateType } from "@prisma/client";
import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";
import {
  PeakRateCreateData,
  PeakRateUpdateData,
  PeakRateCreateValidationResult,
  PeakRateUpdateValidationResult,
  PeakRateRoomIdValidationResult,
  PeakRateDateValidationResult,
} from "../../interfaces/property";

class PeakRateValidationHelper {
  /**
   * Validate room ID parameter
   */
  static validateRoomId(id: string): PeakRateRoomIdValidationResult {
    if (!id) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.ROOM_ID_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate date parameter
   */
  static validateDate(date: string): PeakRateDateValidationResult {
    if (!date) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DATE_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate peak rate creation data
   */
  static validateCreatePeakRateData(data: any): PeakRateCreateValidationResult {
    const { startDate, endDate, rateType, value, description } = data;

    // Validate startDate
    if (!startDate || typeof startDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.START_DATE_REQUIRED,
      };
    }

    // Validate endDate
    if (!endDate || typeof endDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.END_DATE_REQUIRED,
      };
    }

    // Validate rateType
    if (!rateType || !Object.values(RateType).includes(rateType)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.RATE_TYPE_REQUIRED,
      };
    }

    // Validate value
    if (!value || typeof value !== "number") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.VALUE_REQUIRED,
      };
    }

    // Validate description (optional)
    if (description !== undefined && typeof description !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
      };
    }

    const peakRateData: PeakRateCreateData = {
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      rateType: rateType as RateType,
      value: Number(value),
      description: description?.trim(),
    };

    return {
      isValid: true,
      data: peakRateData,
    };
  }

  /**
   * Validate peak rate update data
   */
  static validateUpdatePeakRateData(data: any): PeakRateUpdateValidationResult {
    const { startDate, endDate, rateType, value, description } = data;

    // Check if at least one field is provided
    if (
      startDate === undefined &&
      endDate === undefined &&
      rateType === undefined &&
      value === undefined &&
      description === undefined
    ) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.UPDATE_PEAK_RATE_FIELDS_REQUIRED,
      };
    }

    // Validate startDate if provided
    if (startDate !== undefined && typeof startDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.START_DATE_STRING_FORMAT,
      };
    }

    // Validate endDate if provided
    if (endDate !== undefined && typeof endDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.END_DATE_STRING_FORMAT,
      };
    }

    // Validate rateType if provided
    if (rateType !== undefined && !Object.values(RateType).includes(rateType)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.RATE_TYPE_FIXED_OR_PERCENTAGE,
      };
    }

    // Validate value if provided
    if (value !== undefined && typeof value !== "number") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.VALUE_MUST_BE_NUMBER,
      };
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
      };
    }

    const updateData: PeakRateUpdateData = {};
    if (startDate !== undefined) updateData.startDate = startDate.trim();
    if (endDate !== undefined) updateData.endDate = endDate.trim();
    if (rateType !== undefined) updateData.rateType = rateType as RateType;
    if (value !== undefined) updateData.value = Number(value);
    if (description !== undefined) updateData.description = description.trim();

    return {
      isValid: true,
      data: updateData,
    };
  }

  /**
   * Validate start date field specifically
   */
  static validateStartDateField(startDate: any): {
    isValid: boolean;
    error?: string;
  } {
    if (!startDate || typeof startDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.START_DATE_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate end date field specifically
   */
  static validateEndDateField(endDate: any): {
    isValid: boolean;
    error?: string;
  } {
    if (!endDate || typeof endDate !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.END_DATE_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate rate type field specifically
   */
  static validateRateTypeField(rateType: any): {
    isValid: boolean;
    error?: string;
  } {
    if (!rateType || !Object.values(RateType).includes(rateType)) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.RATE_TYPE_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate value field specifically
   */
  static validateValueField(value: any): { isValid: boolean; error?: string } {
    if (!value || typeof value !== "number") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.VALUE_REQUIRED,
      };
    }
    return { isValid: true };
  }
}

export default PeakRateValidationHelper;
