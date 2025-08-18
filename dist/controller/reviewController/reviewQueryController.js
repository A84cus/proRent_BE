"use strict";
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
exports.updateReviewVisibilityController = exports.getOwnerReviewsController = exports.getPublicReviewsController = void 0;
const reviewQueryService_1 = require("../../service/reviewService/reviewQueryService");
const zod_1 = require("zod");
const index_1 = require("../../config/index");
const reviewInterface_1 = require("../../interfaces/reviewInterface");
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
    console.error('Error in review query controller:', error);
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Invalid input data.',
            details: index_1.NODE_ENV === 'development' ? error : undefined
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
function parseQueryParams(req) {
    const sortBy = req.query.sortBy;
    const validSortByValues = ['createdAt', 'rating', 'updatedAt'];
    return {
        propertyId: req.params.propertyId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy,
        sortOrder: validSortByValues.includes(sortBy) ? req.query.sortOrder : reviewInterface_1.sortOrder.desc,
        searchContent: req.query.searchContent,
        includeInvisible: req.query.includeInvisible === 'true'
    };
}
function prepareVisibilityUpdateInput(req) {
    return {
        reviewId: req.params.reviewId,
        visibility: req.body.visibility
    };
}
// --- Controller: Get Public Reviews ---
const getPublicReviewsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = parseQueryParams(req);
        const result = yield (0, reviewQueryService_1.getReviewsPublic)(filter);
        return res.status(200).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.getPublicReviewsController = getPublicReviewsController;
// --- Controller: Get Owner Reviews ---
const getOwnerReviewsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const OwnerId = getUserIdFromRequest(req);
        const filter = parseQueryParams(req);
        const result = yield (0, reviewQueryService_1.getReviewsForOwner)(Object.assign(Object.assign({}, filter), { OwnerId }));
        return res.status(200).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.getOwnerReviewsController = getOwnerReviewsController;
// --- Controller: Update Review Visibility ---
const updateReviewVisibilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = getUserIdFromRequest(req);
        const { reviewId, visibility } = prepareVisibilityUpdateInput(req);
        const result = yield (0, reviewQueryService_1.updateReviewVisibility)(ownerId, reviewId, visibility);
        return res.status(200).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.updateReviewVisibilityController = updateReviewVisibilityController;
