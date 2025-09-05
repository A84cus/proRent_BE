import { z } from "zod";
import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";
import {
  CreatePropertyData,
  UpdatePropertyData,
  PropertyCreateValidationResult,
  PropertyUpdateValidationResult,
  PropertyIdValidationResult,
} from "../../interfaces/property";

// Zod schemas
const propertyIdSchema = z
  .string()
  .min(1, PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED);

const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED)
    .transform((val) => val.trim()),
  categoryId: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED)
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED)
    .transform((val) => val.trim()),
  mainPictureId: z.string().optional().nullable(),
  location: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.LOCATION_ADDRESS_REQUIRED)
    .transform((val) => val.trim()),
  city: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.CITY_REQUIRED)
    .transform((val) => val.trim()),
  province: z
    .string()
    .min(1, PROPERTY_ERROR_MESSAGES.PROVINCE_REQUIRED)
    .transform((val) => val.trim()),
  rentalType: z
    .enum(["WHOLE_PROPERTY", "ROOM_BY_ROOM"])
    .refine((val) => ["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(val), {
      message: PROPERTY_ERROR_MESSAGES.RENTAL_TYPE_INVALID,
    }),

  latitude: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  longitude: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
});

const updatePropertySchema = z
  .object({
    name: z
      .string()
      .min(1, PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING)
      .transform((val) => val.trim())
      .optional(),
    categoryId: z
      .string()
      .refine(
        (val) => typeof val === "string",
        PROPERTY_ERROR_MESSAGES.CATEGORY_ID_MUST_BE_STRING
      )
      .transform((val) => val.trim())
      .optional(),
    description: z
      .string()
      .min(1, PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_NON_EMPTY_STRING)
      .transform((val) => val.trim())
      .optional(),
    mainPictureId: z
      .string()
      .refine(
        (val) => typeof val === "string",
        PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_MUST_BE_STRING
      )
      .transform((val) => val.trim())
      .optional(),
    location: z
      .string()
      .min(1, PROPERTY_ERROR_MESSAGES.LOCATION_MUST_BE_NON_EMPTY_STRING)
      .transform((val) => val.trim())
      .optional(),
    city: z
      .string()
      .min(1, PROPERTY_ERROR_MESSAGES.CITY_MUST_BE_NON_EMPTY_STRING)
      .transform((val) => val.trim())
      .optional(),
    province: z
      .string()
      .min(1, PROPERTY_ERROR_MESSAGES.PROVINCE_MUST_BE_NON_EMPTY_STRING)
      .transform((val) => val.trim())
      .optional(),
    latitude: z
      .string()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null))
      .optional(),
    longitude: z
      .string()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null))
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    PROPERTY_ERROR_MESSAGES.UPDATE_FIELDS_REQUIRED
  );

// Individual field schemas
const propertyNameSchema = z
  .string()
  .min(1, PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED);

const categoryIdSchema = z
  .string()
  .min(1, PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED);

const descriptionSchema = z
  .string()
  .min(1, PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED);

class PropertyValidationHelper {
  /**
   * Validate property ID parameter
   */
  static validatePropertyId(id: string): PropertyIdValidationResult {
    try {
      propertyIdSchema.parse(id);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED,
      };
    }
  }

  /**
   * Validate property creation data
   */
  static validateCreatePropertyData(data: any): PropertyCreateValidationResult {
    try {
      const validatedData = createPropertySchema.parse(data);

      return {
        isValid: true,
        data: validatedData as CreatePropertyData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: "Validation failed",
      };
    }
  }

  /**
   * Validate property update data
   */
  static validateUpdatePropertyData(data: any): PropertyUpdateValidationResult {
    try {
      const validatedData = updatePropertySchema.parse(data);

      return {
        isValid: true,
        data: validatedData as UpdatePropertyData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: "Validation failed",
      };
    }
  }

  /**
   * Validate individual fields for property
   */
  static validatePropertyName(name: any): { isValid: boolean; error?: string } {
    try {
      propertyNameSchema.parse(name);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED,
      };
    }
  }

  static validateCategoryId(categoryId: any): {
    isValid: boolean;
    error?: string;
  } {
    try {
      categoryIdSchema.parse(categoryId);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
      };
    }
  }

  static validateDescription(description: any): {
    isValid: boolean;
    error?: string;
  } {
    try {
      descriptionSchema.parse(description);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0].message,
        };
      }
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED,
      };
    }
  }
}

export default PropertyValidationHelper;
