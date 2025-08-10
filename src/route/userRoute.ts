import express from "express";
import UserController from "../controller/userController";
import { authenticate } from "../middleware/authMwr";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import ResponseHelper from "../helpers/responseHelper";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
});

// Multer error handler middleware
const multerErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return ResponseHelper.error(
        res,
        "File size too large. Maximum file size allowed is 1MB.",
        undefined,
        400
      );
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return ResponseHelper.error(
        res,
        "Too many files. Only 1 file is allowed.",
        undefined,
        400
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return ResponseHelper.error(
        res,
        "Unexpected field name. Please use 'avatar' as field name.",
        undefined,
        400
      );
    }
    // Other multer errors
    return ResponseHelper.error(
      res,
      `Upload error: ${err.message}`,
      undefined,
      400
    );
  }
  // If not a multer error, pass to next error handler
  next(err);
};

const router = express.Router();

// GET /api/users/me - Get full profile: name, email, phone, avatar, address
router.get("/me", authenticate, UserController.getProfile);

// PATCH /api/users/me - Update profile
router.patch("/me", authenticate, UserController.updateProfile);

// PATCH /api/users/me/password - Change password (requires current + new)
router.patch("/me/password", authenticate, UserController.changePassword);

// POST /api/users/me/avatar - Upload profile picture (≤1MB, .jpg/.png/.gif)
router.post(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  multerErrorHandler,
  UserController.uploadAvatar
);

// POST /api/users/reverify-email - Trigger re-verification when email is updated
router.post("/reverify-email", authenticate, UserController.reverifyEmail);

export default router;
