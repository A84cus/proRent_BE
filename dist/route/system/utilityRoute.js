"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utilityController_1 = __importDefault(require("../../controller/system/utilityController"));
const authMwr_1 = require("../../middleware/auth/authMwr");
const router = express_1.default.Router();
// Utility routes
// POST /api/utility/test-email - Test email service functionality
router.post("/test-email", authMwr_1.authAny, utilityController_1.default.testEmail);
// POST /api/utility/resend-email - Resend verification or reset email for existing user
router.post("/resend-email", authMwr_1.authAny, utilityController_1.default.resendEmail);
// GET /api/utility/email-status - Check email service connection status
router.get("/email-status", utilityController_1.default.checkEmailStatus);
// GET /api/utility/health - Health check endpoint
router.get("/health", utilityController_1.default.healthCheck);
// GET /api/utility/info - Get service information
router.get("/info", utilityController_1.default.getServiceInfo);
exports.default = router;
