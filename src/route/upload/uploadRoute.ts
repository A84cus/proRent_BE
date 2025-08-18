import express from "express";
import uploadController, {
  uploadMiddleware,
} from "../../controller/upload/uploadController";
import { authAny } from "../../middleware/auth/authMwr";

const router = express.Router();

// Upload routes

// POST /upload - Generic file upload (profile, proof, property, room)
// Validate: ≤1MB for images, jpg/png/gif supported
router.post("/", authAny, uploadMiddleware, uploadController.uploadFile);

// DELETE /upload/:id - Delete uploaded file
router.delete("/:id", authAny, uploadController.deleteFile);

// GET /upload/:id - Get file information
router.get("/:id", uploadController.getFileInfo);

// GET /upload - List uploaded files with pagination
router.get("/", authAny, uploadController.listFiles);

export default router;
