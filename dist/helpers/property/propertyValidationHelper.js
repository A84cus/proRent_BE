"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const property_1 = require("../../constants/controllers/property");
// Zod schemas
const propertyIdSchema = zod_1.z
    .string()
    .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED);
const createPropertySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED)
        .transform((val) => val.trim()),
    categoryId: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED)
        .transform((val) => val.trim()),
    description: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED)
        .transform((val) => val.trim()),
    mainPictureId: zod_1.z.string().optional().nullable(),
    location: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.LOCATION_ADDRESS_REQUIRED)
        .transform((val) => val.trim()),
    city: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.CITY_REQUIRED)
        .transform((val) => val.trim()),
    province: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_REQUIRED)
        .transform((val) => val.trim()),
    rentalType: zod_1.z
        .enum(["WHOLE_PROPERTY", "ROOM_BY_ROOM"])
        .refine((val) => ["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(val), {
        message: property_1.PROPERTY_ERROR_MESSAGES.RENTAL_TYPE_INVALID,
    }),
    latitude: zod_1.z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    longitude: zod_1.z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
});
const updatePropertySchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING)
        .transform((val) => val.trim())
        .optional(),
    categoryId: zod_1.z
        .string()
        .refine((val) => typeof val === "string", property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_MUST_BE_STRING)
        .transform((val) => val.trim())
        .optional(),
    description: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_NON_EMPTY_STRING)
        .transform((val) => val.trim())
        .optional(),
    mainPictureId: zod_1.z
        .string()
        .refine((val) => typeof val === "string", property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_MUST_BE_STRING)
        .transform((val) => val.trim())
        .optional(),
    location: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.LOCATION_MUST_BE_NON_EMPTY_STRING)
        .transform((val) => val.trim())
        .optional(),
    city: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.CITY_MUST_BE_NON_EMPTY_STRING)
        .transform((val) => val.trim())
        .optional(),
    province: zod_1.z
        .string()
        .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_MUST_BE_NON_EMPTY_STRING)
        .transform((val) => val.trim())
        .optional(),
    latitude: zod_1.z
        .string()
        .transform((val) => (val && val.trim() !== "" ? val.trim() : null))
        .optional(),
    longitude: zod_1.z
        .string()
        .transform((val) => (val && val.trim() !== "" ? val.trim() : null))
        .optional(),
})
    .refine((data) => Object.values(data).some((val) => val !== undefined), property_1.PROPERTY_ERROR_MESSAGES.UPDATE_FIELDS_REQUIRED);
// Individual field schemas
const propertyNameSchema = zod_1.z
    .string()
    .min(1, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED);
const categoryIdSchema = zod_1.z
    .string()
    .min(1, property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED);
const descriptionSchema = zod_1.z
    .string()
    .min(1, property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED);
class PropertyValidationHelper {
    /**
     * Validate property ID parameter
     */
    static validatePropertyId(id) {
        try {
            propertyIdSchema.parse(id);
            return { isValid: true };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return {
                    isValid: false,
                    error: error.issues[0].message,
                };
            }
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED,
            };
        }
    }
    /**
     * Validate property creation data
     */
    static validateCreatePropertyData(data) {
        try {
            const validatedData = createPropertySchema.parse(data);
            return {
                isValid: true,
                data: validatedData,
            };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    static validateUpdatePropertyData(data) {
        try {
            const validatedData = updatePropertySchema.parse(data);
            return {
                isValid: true,
                data: validatedData,
            };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    static validatePropertyName(name) {
        try {
            propertyNameSchema.parse(name);
            return { isValid: true };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return {
                    isValid: false,
                    error: error.issues[0].message,
                };
            }
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED,
            };
        }
    }
    static validateCategoryId(categoryId) {
        try {
            categoryIdSchema.parse(categoryId);
            return { isValid: true };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return {
                    isValid: false,
                    error: error.issues[0].message,
                };
            }
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
            };
        }
    }
    static validateDescription(description) {
        try {
            descriptionSchema.parse(description);
            return { isValid: true };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return {
                    isValid: false,
                    error: error.issues[0].message,
                };
            }
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED,
            };
        }
    }
}
exports.default = PropertyValidationHelper;
