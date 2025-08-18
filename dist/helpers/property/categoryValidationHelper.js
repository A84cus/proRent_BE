"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
class CategoryValidationHelper {
    /**
     * Validate category ID parameter
     */
    static validateCategoryId(id) {
        if (!id) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate category creation data
     */
    static validateCreateCategoryData(data) {
        const { name, description } = data;
        // Validate name
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_REQUIRED,
            };
        }
        // Validate description (optional)
        if (description && typeof description !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
            };
        }
        const categoryData = {
            name: name.trim(),
            description: (description === null || description === void 0 ? void 0 : description.trim()) || undefined,
        };
        return {
            isValid: true,
            data: categoryData,
        };
    }
    /**
     * Validate category update data
     */
    static validateUpdateCategoryData(data) {
        const { name, description } = data;
        // At least one field must be provided
        if (!name && !description) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_UPDATE_FIELDS_REQUIRED,
            };
        }
        // Validate name if provided
        if (name !== undefined &&
            (typeof name !== "string" || name.trim().length === 0)) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_NON_EMPTY_STRING,
            };
        }
        // Validate description if provided
        if (description !== undefined && typeof description !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
            };
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (description !== undefined) {
            const trimmedDesc = description.trim();
            if (trimmedDesc)
                updateData.description = trimmedDesc;
        }
        return {
            isValid: true,
            data: updateData,
        };
    }
    /**
     * Validate name field specifically
     */
    static validateNameField(name) {
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate description field specifically
     */
    static validateDescriptionField(description) {
        if (description && typeof description !== "string") {
            return {
                isValid: false,
                error: property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
            };
        }
        return { isValid: true };
    }
}
exports.default = CategoryValidationHelper;
