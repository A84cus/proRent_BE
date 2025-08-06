"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controller/userController"));
const authMwr_1 = require("../middleware/authMwr");
const multer_1 = __importDefault(require("multer"));
const responseHelper_1 = __importDefault(require("../helpers/responseHelper"));
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024, // 1MB limit
    },
});
// Multer error handler middleware
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return responseHelper_1.default.error(res, "File size too large. Maximum file size allowed is 1MB.", undefined, 400);
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return responseHelper_1.default.error(res, "Too many files. Only 1 file is allowed.", undefined, 400);
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return responseHelper_1.default.error(res, "Unexpected field name. Please use 'avatar' as field name.", undefined, 400);
        }
        // Other multer errors
        return responseHelper_1.default.error(res, `Upload error: ${err.message}`, undefined, 400);
    }
    // If not a multer error, pass to next error handler
    next(err);
};
const router = express_1.default.Router();
// GET /api/users/me - Get full profile: name, email, phone, avatar, address
router.get("/me", authMwr_1.authenticate, userController_1.default.getProfile);
// PATCH /api/users/me - Update profile
router.patch("/me", authMwr_1.authenticate, userController_1.default.updateProfile);
// PATCH /api/users/me/password - Change password (requires current + new)
router.patch("/me/password", authMwr_1.authenticate, userController_1.default.changePassword);
// POST /api/users/me/avatar - Upload profile picture (≤1MB, .jpg/.png/.gif)
router.post("/me/avatar", authMwr_1.authenticate, upload.single("avatar"), multerErrorHandler, userController_1.default.uploadAvatar);
// POST /api/users/reverify-email - Trigger re-verification when email is updated
router.post("/reverify-email", authMwr_1.authenticate, userController_1.default.reverifyEmail);
exports.default = router;
