"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controller/authController"));
const authMwr_1 = require("../middleware/authMwr");
const router = express_1.default.Router();
// Authentication routes
// POST /auth/register/user - Register a new User (calon penyewa)
router.post("/register/user", authController_1.default.registerUser);
// POST /auth/register/owner - Register a new Owner (pemilik penginapan)
router.post("/register/owner", authController_1.default.registerOwner);
// GET /auth/verify-email?token=... - Verify email and set password (1-hour expiry)
router.get("/verify-email", authController_1.default.verifyEmail);
// POST /auth/resend-verify - Resend verification email if not verified
router.post("/resend-verify", authController_1.default.resendVerification);
// POST /auth/login - Login using email/password or social login
router.post("/login", authController_1.default.login);
// POST /auth/reset-password-request - Request password reset link (email sent)
router.post("/reset-password-request", authController_1.default.resetPasswordRequest);
// POST /auth/reset-password-confirm - Confirm reset with token and set new password
router.post("/reset-password-confirm", authController_1.default.resetPasswordConfirm);
// GET /auth/me - Get current user data (role, email, isVerified) - Protected route
router.get("/me", authMwr_1.authAny, authController_1.default.getCurrentUser);
exports.default = router;
