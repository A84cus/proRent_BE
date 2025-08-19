import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import categoryService from "../../service/property/categoryService";
import { PROPERTY_SUCCESS_MESSAGES } from "../../constants/controllers/property";
import {
  CategoryValidationHelper,
  CategoryErrorHelper,
} from "../../helpers/property";

class CategoryController extends BaseController {
  /**
   * GET /api/owner/categories - Get all categories
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.CATEGORIES_RETRIEVED,
        categories
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "getAllCategories",
        CategoryErrorHelper.getAllCategoriesErrorMappings()
      );
    }
  }

  /**
   * POST /api/owner/categories - Create new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      // Validate request data
      const validation = CategoryValidationHelper.validateCreateCategoryData(
        req.body
      );
      if (!validation.isValid) {
        ResponseHelper.error(res, validation.error!, undefined, 400);
        return;
      }

      // Create category
      const newCategory = await categoryService.createCategory(
        validation.data!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.CATEGORY_CREATED,
        newCategory,
        201
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "createCategory",
        CategoryErrorHelper.getCreateCategoryErrorMappings()
      );
    }
  }

  /**
   * PATCH /api/owner/categories/:id - Update category
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      // Validate category ID
      const { id } = req.params;
      const idValidation = CategoryValidationHelper.validateCategoryId(id);
      if (!idValidation.isValid) {
        ResponseHelper.error(res, idValidation.error!, undefined, 400);
        return;
      }

      // Validate update data
      const dataValidation =
        CategoryValidationHelper.validateUpdateCategoryData(req.body);
      if (!dataValidation.isValid) {
        ResponseHelper.error(res, dataValidation.error!, undefined, 400);
        return;
      }

      // Update category
      const updatedCategory = await categoryService.updateCategory(
        id,
        dataValidation.data!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.CATEGORY_UPDATED,
        updatedCategory
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "updateCategory",
        CategoryErrorHelper.getUpdateCategoryErrorMappings()
      );
    }
  }

  /**
   * DELETE /api/owner/categories/:id - Delete category
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      // Validate category ID
      const { id } = req.params;
      const idValidation = CategoryValidationHelper.validateCategoryId(id);
      if (!idValidation.isValid) {
        ResponseHelper.error(res, idValidation.error!, undefined, 400);
        return;
      }

      // Delete category
      await categoryService.deleteCategory(id);

      ResponseHelper.success(res, PROPERTY_SUCCESS_MESSAGES.CATEGORY_DELETED);
    } catch (error) {
      this.handleError(
        res,
        error,
        "deleteCategory",
        CategoryErrorHelper.getDeleteCategoryErrorMappings()
      );
    }
  }
}

export default new CategoryController();
