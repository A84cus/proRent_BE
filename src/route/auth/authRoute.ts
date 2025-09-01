import express from "express";
import authController from "../../controller/auth/authController";
import { authAny } from "../../middleware/auth/authMwr";

const router = express.Router();

// Authentication routes

// POST /auth/register/user - Register a new User (calon penyewa) and Owner
router.post("/register/user", authController.registerUser);

// GET /auth/verify-email?token=... - Verify email and set password (1-hour expiry)
router.get("/verify-email", authController.verifyEmail);

// POST /auth/verify-email - Verify email with token in body (for frontend compatibility)
router.post("/verify-email", authController.verifyEmail);

// POST /auth/resend-verify - Resend verification email if not verified
router.post("/resend-verify", authController.resendVerification);

// POST /auth/login - Login using email/password or social login
router.post("/login", authController.login);

// POST /auth/reset-password-request - Request password reset link (email sent)
router.post("/reset-password-request", authController.resetPasswordRequest);

// POST /auth/reset-password-confirm - Confirm reset with token and set new password
router.post("/reset-password-confirm", authController.resetPasswordConfirm);

// GET /auth/me - Get current user data (role, email, isVerified) - Protected route
router.get("/me", authAny, authController.getCurrentUser);

export default router;
