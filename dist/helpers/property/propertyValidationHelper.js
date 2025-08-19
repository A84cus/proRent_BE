"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
class PropertyValidationHelper {
    /**
     * Validate property ID parameter
     */
    static validatePropertyId(id) {
        if (!id) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate property creation data
     */
    static validateCreatePropertyData(data) {
        const { name, categoryId, description, mainPictureId, location, city, province, } = data;
        // Validate name
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED,
            };
        }
        // Validate categoryId
        if (!categoryId || typeof categoryId !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
            };
        }
        // Validate description
        if (!description ||
            typeof description !== "string" ||
            description.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED,
            };
        }
        // Validate mainPictureId
        if (!mainPictureId || typeof mainPictureId !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_REQUIRED,
            };
        }
        // Validate location
        if (!location ||
            typeof location !== "string" ||
            location.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.LOCATION_ADDRESS_REQUIRED,
            };
        }
        // Validate city
        if (!city || typeof city !== "string" || city.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CITY_REQUIRED,
            };
        }
        // Validate province
        if (!province ||
            typeof province !== "string" ||
            province.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_REQUIRED,
            };
        }
        const propertyData = {
            name: name.trim(),
            categoryId: categoryId.trim(),
            description: description.trim(),
            mainPictureId: mainPictureId.trim(),
            location: location.trim(),
            city: city.trim(),
            province: province.trim(),
        };
        return {
            isValid: true,
            data: propertyData,
        };
    }
    /**
     * Validate property update data
     */
    static validateUpdatePropertyData(data) {
        const { name, categoryId, description, mainPictureId, location, city, province, } = data;
        // Check if at least one field is provided
        if (name === undefined &&
            categoryId === undefined &&
            description === undefined &&
            mainPictureId === undefined &&
            location === undefined &&
            city === undefined &&
            province === undefined) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.UPDATE_FIELDS_REQUIRED,
            };
        }
        // Validate name if provided
        if (name !== undefined &&
            (typeof name !== "string" || name.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING,
            };
        }
        // Validate categoryId if provided
        if (categoryId !== undefined && typeof categoryId !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_MUST_BE_STRING,
            };
        }
        // Validate description if provided
        if (description !== undefined &&
            (typeof description !== "string" || description.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_NON_EMPTY_STRING,
            };
        }
        // Validate mainPictureId if provided
        if (mainPictureId !== undefined && typeof mainPictureId !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_MUST_BE_STRING,
            };
        }
        // Validate location if provided
        if (location !== undefined &&
            (typeof location !== "string" || location.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.LOCATION_MUST_BE_NON_EMPTY_STRING,
            };
        }
        // Validate city if provided
        if (city !== undefined &&
            (typeof city !== "string" || city.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CITY_MUST_BE_NON_EMPTY_STRING,
            };
        }
        // Validate province if provided
        if (province !== undefined &&
            (typeof province !== "string" || province.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_MUST_BE_NON_EMPTY_STRING,
            };
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (categoryId !== undefined)
            updateData.categoryId = categoryId.trim();
        if (description !== undefined)
            updateData.description = description.trim();
        if (mainPictureId !== undefined)
            updateData.mainPictureId = mainPictureId.trim();
        if (location !== undefined)
            updateData.location = location.trim();
        if (city !== undefined)
            updateData.city = city.trim();
        if (province !== undefined)
            updateData.province = province.trim();
        return {
            isValid: true,
            data: updateData,
        };
    }
    /**
     * Validate individual fields for property
     */
    static validatePropertyName(name) {
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED,
            };
        }
        return { isValid: true };
    }
    static validateCategoryId(categoryId) {
        if (!categoryId || typeof categoryId !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
            };
        }
        return { isValid: true };
    }
    static validateDescription(description) {
        if (!description ||
            typeof description !== "string" ||
            description.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED,
            };
        }
        return { isValid: true };
    }
}
exports.default = PropertyValidationHelper;
