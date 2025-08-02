import express from "express";
import utilityController from "../controller/utilityController";
import { authAny } from "../middleware/authMwr";

const router = express.Router();

// Utility routes

// POST /api/utility/test-email - Test email service functionality
router.post("/test-email", authAny, utilityController.testEmail);

// POST /api/utility/resend-email - Resend verification or reset email for existing user
router.post("/resend-email", authAny, utilityController.resendEmail);

// GET /api/utility/email-status - Check email service connection status
router.get("/email-status", utilityController.checkEmailStatus);

// GET /api/utility/health - Health check endpoint
router.get("/health", utilityController.healthCheck);

// GET /api/utility/info - Get service information
router.get("/info", utilityController.getServiceInfo);

export default router;
