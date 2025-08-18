"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controller/reviewController/reviewController");
const reviewQueryController_1 = require("../controller/reviewController/reviewQueryController");
const authMwr_1 = require("../middleware/authMwr");
const router = express_1.default.Router();
// Review Creation and Reply Routes
router.post('/', authMwr_1.authUser, reviewController_1.createReviewController);
router.post('/:reviewId/reply', authMwr_1.authOwner, reviewController_1.replyToReviewController);
// Review Query Routes
router.get('/property/:propertyId', reviewQueryController_1.getPublicReviewsController);
router.get('/owner/property/:propertyId', authMwr_1.authOwner, reviewQueryController_1.getOwnerReviewsController);
// Review Management Routes
router.patch('/:reviewId/visibility', authMwr_1.authOwner, reviewQueryController_1.updateReviewVisibilityController);
exports.default = router;
