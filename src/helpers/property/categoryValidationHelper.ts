import { PROPERTY_ERROR_MESSAGES } from "../../constants/controllers/property";
import {
  CategoryCreateData,
  CategoryUpdateData,
  CategoryCreateValidationResult,
  CategoryUpdateValidationResult,
  CategoryIdValidationResult,
} from "../../interfaces/property";

class CategoryValidationHelper {
  /**
   * Validate category ID parameter
   */
  static validateCategoryId(id: string): CategoryIdValidationResult {
    if (!id) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate category creation data
   */
  static validateCreateCategoryData(data: any): CategoryCreateValidationResult {
    const { name, description } = data;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_REQUIRED,
      };
    }

    // Validate description (optional)
    if (description && typeof description !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
      };
    }

    const categoryData: CategoryCreateData = {
      name: name.trim(),
      description: description?.trim() || undefined,
    };

    return {
      isValid: true,
      data: categoryData,
    };
  }

  /**
   * Validate category update data
   */
  static validateUpdateCategoryData(data: any): CategoryUpdateValidationResult {
    const { name, description } = data;

    // At least one field must be provided
    if (!name && !description) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_UPDATE_FIELDS_REQUIRED,
      };
    }

    // Validate name if provided
    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_NON_EMPTY_STRING,
      };
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
      };
    }

    const updateData: CategoryUpdateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) {
      const trimmedDesc = description.trim();
      if (trimmedDesc) updateData.description = trimmedDesc;
    }

    return {
      isValid: true,
      data: updateData,
    };
  }

  /**
   * Validate name field specifically
   */
  static validateNameField(name: any): { isValid: boolean; error?: string } {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.CATEGORY_NAME_REQUIRED,
      };
    }
    return { isValid: true };
  }

  /**
   * Validate description field specifically
   */
  static validateDescriptionField(description: any): {
    isValid: boolean;
    error?: string;
  } {
    if (description && typeof description !== "string") {
      return {
        isValid: false,
        error: PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_STRING,
      };
    }
    return { isValid: true };
  }
}

export default CategoryValidationHelper;
