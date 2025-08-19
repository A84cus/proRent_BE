import express from 'express';
import { createReviewController, replyToReviewController } from '../controller/reviewController/reviewController';

import {
   getPublicReviewsController,
   getOwnerReviewsController,
   updateReviewVisibilityController
} from '../controller/reviewController/reviewQueryController';

import { authUser, authOwner, authAny } from '../middleware';

const router = express.Router();

// Review Creation and Reply Routes
router.post('/', authUser, createReviewController);
router.post('/:reviewId/reply', authOwner, replyToReviewController);

// Review Query Routes
router.get('/property/:propertyId', getPublicReviewsController);
router.get('/owner/property/:propertyId', authOwner, getOwnerReviewsController);

// Review Management Routes
router.patch('/:reviewId/visibility', authOwner, updateReviewVisibilityController);

export default router;
