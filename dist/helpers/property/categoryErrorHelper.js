"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
class CategoryErrorHelper {
    /**
     * Get error mappings for get all categories operations
     */
    static getAllCategoriesErrorMappings() {
        return {
            "Failed to fetch categories": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES,
                statusCode: 500,
            },
        };
    }
    /**
     * Get error mappings for create category operations
     */
    static getCreateCategoryErrorMappings() {
        return {
            "Category name already exists": {
                message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_ALREADY_EXISTS,
                statusCode: 409,
            },
            "Failed to create category": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_CREATE_CATEGORY,
                statusCode: 500,
            },
        };
    }
    /**
     * Get error mappings for update category operations
     */
    static getUpdateCategoryErrorMappings() {
        return {
            "Category not found": {
                message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
                statusCode: 404,
            },
            "Category name already exists": {
                message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_ALREADY_EXISTS,
                statusCode: 409,
            },
            "Failed to update category": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_UPDATE_CATEGORY,
                statusCode: 500,
            },
        };
    }
    /**
     * Get error mappings for delete category operations
     */
    static getDeleteCategoryErrorMappings() {
        return {
            "Category not found": {
                message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
                statusCode: 404,
            },
            "Cannot delete category that is being used by properties": {
                message: property_1.PROPERTY_ERROR_MESSAGES.CANNOT_DELETE_CATEGORY_IN_USE,
                statusCode: 409,
            },
            "Failed to delete category": {
                message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_DELETE_CATEGORY,
                statusCode: 500,
            },
        };
    }
}
exports.default = CategoryErrorHelper;
