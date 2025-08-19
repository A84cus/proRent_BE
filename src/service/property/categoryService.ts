import { Category } from "@prisma/client";
import categoryRepository from "../../repository/property/categoryRepository";
import logger from "../../utils/system/logger";
import {
  CreateCategoryData,
  UpdateCategoryData,
} from "../../interfaces/property";

class CategoryService {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      return await categoryRepository.findAll();
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await categoryRepository.findById(id);
    } catch (error) {
      logger.error(`Error fetching category with ID ${id}:`, error);
      throw new Error("Failed to fetch category");
    }
  }

  // Create new category
  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      // Check if category name already exists
      const existingCategory = await categoryRepository.findByName(data.name);
      if (existingCategory) {
        throw new Error("Category name already exists");
      }

      return await categoryRepository.create({
        name: data.name,
        description: data.description || null,
      });
    } catch (error) {
      logger.error("Error creating category:", error);
      if (
        error instanceof Error &&
        error.message === "Category name already exists"
      ) {
        throw error;
      }
      throw new Error("Failed to create category");
    }
  }

  // Update category
  async updateCategory(
    id: string,
    data: UpdateCategoryData
  ): Promise<Category> {
    try {
      // Check if category exists
      const existingCategory = await categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if the new name already exists (if name is being updated)
      if (data.name && data.name !== existingCategory.name) {
        const categoryWithSameName = await categoryRepository.findByName(
          data.name
        );
        if (categoryWithSameName) {
          throw new Error("Category name already exists");
        }
      }

      return await categoryRepository.update(id, data);
    } catch (error) {
      logger.error(`Error updating category with ID ${id}:`, error);
      if (
        error instanceof Error &&
        (error.message === "Category not found" ||
          error.message === "Category name already exists")
      ) {
        throw error;
      }
      throw new Error("Failed to update category");
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category exists
      const existingCategory = await categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if category is being used by any property
      const isUsed = await categoryRepository.isUsedByProperty(id);
      if (isUsed) {
        throw new Error(
          "Cannot delete category that is being used by properties"
        );
      }

      await categoryRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting category with ID ${id}:`, error);
      if (
        error instanceof Error &&
        (error.message === "Category not found" ||
          error.message ===
            "Cannot delete category that is being used by properties")
      ) {
        throw error;
      }
      throw new Error("Failed to delete category");
    }
  }
}

export default new CategoryService();
