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
const categoryRepository_1 = __importDefault(require("../repository/categoryRepository"));
const logger_1 = __importDefault(require("../utils/logger"));
class CategoryService {
    // Get all categories
    getAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield categoryRepository_1.default.findAll();
            }
            catch (error) {
                logger_1.default.error("Error fetching categories:", error);
                throw new Error("Failed to fetch categories");
            }
        });
    }
    // Get category by ID
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield categoryRepository_1.default.findById(id);
            }
            catch (error) {
                logger_1.default.error(`Error fetching category with ID ${id}:`, error);
                throw new Error("Failed to fetch category");
            }
        });
    }
    // Create new category
    createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if category name already exists
                const existingCategory = yield categoryRepository_1.default.findByName(data.name);
                if (existingCategory) {
                    throw new Error("Category name already exists");
                }
                return yield categoryRepository_1.default.create({
                    name: data.name,
                    description: data.description || null,
                });
            }
            catch (error) {
                logger_1.default.error("Error creating category:", error);
                if (error instanceof Error &&
                    error.message === "Category name already exists") {
                    throw error;
                }
                throw new Error("Failed to create category");
            }
        });
    }
    // Update category
    updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if category exists
                const existingCategory = yield categoryRepository_1.default.findById(id);
                if (!existingCategory) {
                    throw new Error("Category not found");
                }
                // Check if the new name already exists (if name is being updated)
                if (data.name && data.name !== existingCategory.name) {
                    const categoryWithSameName = yield categoryRepository_1.default.findByName(data.name);
                    if (categoryWithSameName) {
                        throw new Error("Category name already exists");
                    }
                }
                return yield categoryRepository_1.default.update(id, data);
            }
            catch (error) {
                logger_1.default.error(`Error updating category with ID ${id}:`, error);
                if (error instanceof Error &&
                    (error.message === "Category not found" ||
                        error.message === "Category name already exists")) {
                    throw error;
                }
                throw new Error("Failed to update category");
            }
        });
    }
    // Delete category
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if category exists
                const existingCategory = yield categoryRepository_1.default.findById(id);
                if (!existingCategory) {
                    throw new Error("Category not found");
                }
                // Check if category is being used by any property
                const isUsed = yield categoryRepository_1.default.isUsedByProperty(id);
                if (isUsed) {
                    throw new Error("Cannot delete category that is being used by properties");
                }
                yield categoryRepository_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error deleting category with ID ${id}:`, error);
                if (error instanceof Error &&
                    (error.message === "Category not found" ||
                        error.message ===
                            "Cannot delete category that is being used by properties")) {
                    throw error;
                }
                throw new Error("Failed to delete category");
            }
        });
    }
}
exports.default = new CategoryService();
