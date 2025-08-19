import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";

export interface ErrorMapping {
  [key: string]: {
    message: string;
    statusCode: number;
  };
}

class CategoryErrorHelper {
  /**
   * Get error mappings for get all categories operations
   */
  static getAllCategoriesErrorMappings(): ErrorMapping {
    return {
      "Failed to fetch categories": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES,
        statusCode: 500,
      },
    };
  }

  /**
   * Get error mappings for create category operations
   */
  static getCreateCategoryErrorMappings(): ErrorMapping {
    return {
      "Category name already exists": {
        message: PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_ALREADY_EXISTS,
        statusCode: 409,
      },
      "Failed to create category": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_CREATE_CATEGORY,
        statusCode: 500,
      },
    };
  }

  /**
   * Get error mappings for update category operations
   */
  static getUpdateCategoryErrorMappings(): ErrorMapping {
    return {
      "Category not found": {
        message: PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
        statusCode: 404,
      },
      "Category name already exists": {
        message: PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_ALREADY_EXISTS,
        statusCode: 409,
      },
      "Failed to update category": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_UPDATE_CATEGORY,
        statusCode: 500,
      },
    };
  }

  /**
   * Get error mappings for delete category operations
   */
  static getDeleteCategoryErrorMappings(): ErrorMapping {
    return {
      "Category not found": {
        message: PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
        statusCode: 404,
      },
      "Cannot delete category that is being used by properties": {
        message: PROPERTY_ERROR_MESSAGES.CANNOT_DELETE_CATEGORY_IN_USE,
        statusCode: 409,
      },
      "Failed to delete category": {
        message: PROPERTY_ERROR_MESSAGES.FAILED_TO_DELETE_CATEGORY,
        statusCode: 500,
      },
    };
  }
}

export default CategoryErrorHelper;
