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
const BaseController_1 = __importDefault(require("./BaseController"));
const responseHelper_1 = __importDefault(require("../helpers/responseHelper"));
const categoryService_1 = __importDefault(require("../service/categoryService"));
class CategoryController extends BaseController_1.default {
    // GET /api/owner/categories - Get all categories
    getAllCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield categoryService_1.default.getAllCategories();
                responseHelper_1.default.success(res, "Categories retrieved successfully", categories);
            }
            catch (error) {
                this.handleError(res, error, "getAllCategories", {
                    "Failed to fetch categories": {
                        message: "Failed to fetch categories",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // POST /api/owner/categories - Create new category
    createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description } = req.body;
                // Validation
                if (!name || typeof name !== "string" || name.trim().length === 0) {
                    responseHelper_1.default.error(res, "Category name is required", undefined, 400);
                    return;
                }
                if (description && typeof description !== "string") {
                    responseHelper_1.default.error(res, "Description must be a string", undefined, 400);
                    return;
                }
                const categoryData = {
                    name: name.trim(),
                    description: (description === null || description === void 0 ? void 0 : description.trim()) || undefined,
                };
                const newCategory = yield categoryService_1.default.createCategory(categoryData);
                responseHelper_1.default.success(res, "Category created successfully", newCategory, 201);
            }
            catch (error) {
                this.handleError(res, error, "createCategory", {
                    "Category name already exists": {
                        message: "Category name already exists",
                        statusCode: 409,
                    },
                    "Failed to create category": {
                        message: "Failed to create category",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // PATCH /api/owner/categories/:id - Update category
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, description } = req.body;
                // Validation
                if (!id) {
                    responseHelper_1.default.error(res, "Category ID is required", undefined, 400);
                    return;
                }
                if (!name && !description) {
                    responseHelper_1.default.error(res, "At least one field (name or description) is required", undefined, 400);
                    return;
                }
                if (name !== undefined &&
                    (typeof name !== "string" || name.trim().length === 0)) {
                    responseHelper_1.default.error(res, "Category name must be a non-empty string", undefined, 400);
                    return;
                }
                if (description !== undefined && typeof description !== "string") {
                    responseHelper_1.default.error(res, "Description must be a string", undefined, 400);
                    return;
                }
                const updateData = {};
                if (name !== undefined)
                    updateData.name = name.trim();
                if (description !== undefined) {
                    const trimmedDesc = description.trim();
                    if (trimmedDesc)
                        updateData.description = trimmedDesc;
                }
                const updatedCategory = yield categoryService_1.default.updateCategory(id, updateData);
                responseHelper_1.default.success(res, "Category updated successfully", updatedCategory);
            }
            catch (error) {
                this.handleError(res, error, "updateCategory", {
                    "Category not found": {
                        message: "Category not found",
                        statusCode: 404,
                    },
                    "Category name already exists": {
                        message: "Category name already exists",
                        statusCode: 409,
                    },
                    "Failed to update category": {
                        message: "Failed to update category",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // DELETE /api/owner/categories/:id - Delete category
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Validation
                if (!id) {
                    responseHelper_1.default.error(res, "Category ID is required", undefined, 400);
                    return;
                }
                yield categoryService_1.default.deleteCategory(id);
                responseHelper_1.default.success(res, "Category deleted successfully");
            }
            catch (error) {
                this.handleError(res, error, "deleteCategory", {
                    "Category not found": {
                        message: "Category not found",
                        statusCode: 404,
                    },
                    "Cannot delete category that is being used by properties": {
                        message: "Cannot delete category that is being used by properties",
                        statusCode: 409,
                    },
                    "Failed to delete category": {
                        message: "Failed to delete category",
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new CategoryController();
