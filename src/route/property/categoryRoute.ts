import { Router } from "express";
import categoryController from "../../controller/property/categoryController";
import { authOwner } from "../../middleware/auth/authMwr";

const router = Router();

// GET /api/owner/categories - Get all categories
router.get(
  "/",
  authOwner,
  categoryController.getAllCategories.bind(categoryController)
);

// POST /api/owner/categories - Create new category
router.post(
  "/",
  authOwner,
  categoryController.createCategory.bind(categoryController)
);

// PATCH /api/owner/categories/:id - Update category
router.patch(
  "/:id",
  authOwner,
  categoryController.updateCategory.bind(categoryController)
);

// DELETE /api/owner/categories/:id - Delete category
router.delete(
  "/:id",
  authOwner,
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
