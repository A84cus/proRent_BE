import { z } from "zod";
import {
  CategoryCreateData,
  CategoryUpdateData,
} from "../../interfaces/property";

/**
 * Validation schema for category creation
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").trim(),
    description: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
  }),
}) satisfies z.ZodType<{ body: CategoryCreateData }>;

/**
 * Validation schema for category update
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, "Category name cannot be empty")
        .trim()
        .optional(),
      description: z
        .string()
        .optional()
        .transform((val) => val?.trim() || undefined),
    })
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: "At least one field (name or description) must be provided",
      }
    ),
});

/**
 * Validation schema for category deletion
 */
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryRequest = z.infer<typeof deleteCategorySchema>;
