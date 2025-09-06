"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = __importDefault(require("../BaseController"));
const responseHelper_1 = __importDefault(require("../../helpers/system/responseHelper"));
const categoryService_1 = __importDefault(require("../../service/property/categoryService"));
const property_1 = require("../../constants/controllers/property");
const property_2 = require("../../helpers/property");
class CategoryController extends BaseController_1.default {
    /**
     * GET /api/owner/categories - Get all categories
     */
    getAllCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield categoryService_1.default.getAllCategories();
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.CATEGORIES_RETRIEVED, categories);
            }
            catch (error) {
                this.handleError(res, error, "getAllCategories", property_2.CategoryErrorHelper.getAllCategoriesErrorMappings());
            }
        });
    }
    /**
     * POST /api/owner/categories - Create new category
     */
    createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request data
                const validation = property_2.CategoryValidationHelper.validateCreateCategoryData(req.body);
                if (!validation.isValid) {
                    responseHelper_1.default.error(res, validation.error, undefined, 400);
                    return;
                }
                // Create category
                const newCategory = yield categoryService_1.default.createCategory(validation.data);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.CATEGORY_CREATED, newCategory, 201);
            }
            catch (error) {
                this.handleError(res, error, "createCategory", property_2.CategoryErrorHelper.getCreateCategoryErrorMappings());
            }
        });
    }
    /**
     * PATCH /api/owner/categories/:id - Update category
     */
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate category ID
                const { id } = req.params;
                const idValidation = property_2.CategoryValidationHelper.validateCategoryId(id);
                if (!idValidation.isValid) {
                    responseHelper_1.default.error(res, idValidation.error, undefined, 400);
                    return;
                }
                // Validate update data
                const dataValidation = property_2.CategoryValidationHelper.validateUpdateCategoryData(req.body);
                if (!dataValidation.isValid) {
                    responseHelper_1.default.error(res, dataValidation.error, undefined, 400);
                    return;
                }
                // Update category
                const updatedCategory = yield categoryService_1.default.updateCategory(id, dataValidation.data);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.CATEGORY_UPDATED, updatedCategory);
            }
            catch (error) {
                this.handleError(res, error, "updateCategory", property_2.CategoryErrorHelper.getUpdateCategoryErrorMappings());
            }
        });
    }
    /**
     * DELETE /api/owner/categories/:id - Delete category
     */
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate category ID
                const { id } = req.params;
                const idValidation = property_2.CategoryValidationHelper.validateCategoryId(id);
                if (!idValidation.isValid) {
                    responseHelper_1.default.error(res, idValidation.error, undefined, 400);
                    return;
                }
                // Delete category
                yield categoryService_1.default.deleteCategory(id);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.CATEGORY_DELETED);
            }
            catch (error) {
                this.handleError(res, error, "deleteCategory", property_2.CategoryErrorHelper.getDeleteCategoryErrorMappings());
            }
        });
    }
}
exports.default = new CategoryController();
