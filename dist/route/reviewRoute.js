"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controller/reviewController/reviewController");
const reviewQueryController_1 = require("../controller/reviewController/reviewQueryController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Review Creation and Reply Routes
router.post('/', middleware_1.authUser, reviewController_1.createReviewController);
router.post('/:reviewId/reply', middleware_1.authOwner, reviewController_1.replyToReviewController);
// Review Query Routes
router.get('/property/:propertyId', reviewQueryController_1.getPublicReviewsController);
router.get('/owner/property/:propertyId', middleware_1.authOwner, reviewQueryController_1.getOwnerReviewsController);
// Review Management Routes
router.patch('/:reviewId/visibility', middleware_1.authOwner, reviewQueryController_1.updateReviewVisibilityController);
exports.default = router;
