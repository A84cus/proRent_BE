"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToReviewController = exports.createReviewController = void 0;
const reviewService_1 = require("../../service/reviewService/reviewService");
const zod_1 = __importStar(require("zod"));
const index_1 = require("../../config/index");
const reviewValidation_1 = require("../../validations/reviewValidation"); // Import safeParse functions
// --- Helper Functions (Each <15 lines) ---
function getUserIdFromRequest(req) {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new Error('AUTH_REQUIRED');
    }
    return userId;
}
function handleError(res, error) {
    console.error('Error in review controller:', error);
    if (error instanceof zod_1.ZodError) {
        // Use .flatten() for a simpler error structure, or .format() for nested paths
        const flatErrors = zod_1.default.treeifyError(error);
        return res.status(400).json({
            error: 'Invalid input data.',
            // Provide structured error details in development
            details: index_1.NODE_ENV === 'development' ? flatErrors : undefined
            // Example of just sending messages: issues: flatErrors.fieldErrors
        });
    }
    if (error.message === 'AUTH_REQUIRED') {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    if (error.message) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unexpected error occurred.' });
}
// --- Controller: Create Review ---
const createReviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromRequest(req);
        // 1. Prepare raw input data
        const rawInputData = Object.assign(Object.assign({}, req.body), { userId // Add authenticated user ID
         });
        // 2. Validate input using Zod's safeParse
        const validationResult = (0, reviewValidation_1.safeParseCreateReview)(rawInputData);
        // 3. Check if validation failed
        if (!validationResult.success) {
            // If validation failed, pass the ZodError to handleError
            throw validationResult.error;
        }
        // 4. If successful, use the validated and typed data
        const validatedInputData = validationResult.data;
        // 5. Proceed with service logic
        const result = yield (0, reviewService_1.createReview)(validatedInputData);
        return res.status(201).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.createReviewController = createReviewController;
// --- Controller: Owner Replies to Review ---
const replyToReviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = getUserIdFromRequest(req);
        const reviewId = req.params.reviewId; // Get reviewId from URL path
        // Check if reviewId is present in the path
        if (!reviewId) {
            throw new Error('REVIEW_ID_REQUIRED_IN_PATH');
        }
        // 1. Prepare raw body data (only content should be here)
        const rawBodyData = Object.assign({}, req.body // This should contain 'content'
        );
        // 2. Validate ONLY the body content using the new schema helper
        const validationResult = (0, reviewValidation_1.safeParseReplyToReviewBody)(rawBodyData);
        // 3. Check if validation failed
        if (!validationResult.success) {
            // If validation failed, pass the ZodError to handleError
            throw validationResult.error;
        }
        // 4. If successful, use the validated body data
        const validatedBodyData = validationResult.data;
        // 5. Prepare the complete input data for the service, combining validated body with path/user data
        const serviceInputData = {
            OwnerId: ownerId,
            reviewId,
            content: validatedBodyData.content
            // Add rating if your service expects it and it's in the body
            // rating: validatedBodyData.rating // Only if applicable
        };
        // 6. Proceed with service logic using the correctly structured data
        const result = yield (0, reviewService_1.replyToReview)(serviceInputData);
        return res.status(200).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.replyToReviewController = replyToReviewController;
