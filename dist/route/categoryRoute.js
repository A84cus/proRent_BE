"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = __importDefault(require("../controller/categoryController"));
const authMwr_1 = require("../middleware/authMwr");
const router = (0, express_1.Router)();
// GET /api/owner/categories - Get all categories
router.get("/", authMwr_1.authOwner, categoryController_1.default.getAllCategories.bind(categoryController_1.default));
// POST /api/owner/categories - Create new category
router.post("/", authMwr_1.authOwner, categoryController_1.default.createCategory.bind(categoryController_1.default));
// PATCH /api/owner/categories/:id - Update category
router.patch("/:id", authMwr_1.authOwner, categoryController_1.default.updateCategory.bind(categoryController_1.default));
// DELETE /api/owner/categories/:id - Delete category
router.delete("/:id", authMwr_1.authOwner, categoryController_1.default.deleteCategory.bind(categoryController_1.default));
exports.default = router;
