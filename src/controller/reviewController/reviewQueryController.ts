// controllers/reviewQueryController.ts
import { Request, Response } from 'express';
import {
   getReviewsPublic,
   getReviewsForOwner,
   updateReviewVisibility
} from '../../service/reviewService/reviewQueryService';
import { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index';
import { GetReviewsFilter, GetReviewsFilterForOwner, sortBy, sortOrder } from '../../interfaces';

// --- Helper Functions (Each <15 lines) ---

function getUserIdFromRequest (req: Request): string {
   const userId = req.user?.userId;
   if (!userId) {
      throw new Error('AUTH_REQUIRED');
   }
   return userId;
}

function handleError (res: Response, error: any): Response {
   console.error('Error in review query controller:', error);

   if (error instanceof ZodError) {
      return res.status(400).json({
         error: 'Invalid input data.',
         details: NODE_ENV === 'development' ? error : undefined
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

function parseQueryParams (req: Request): GetReviewsFilter {
   const sortBy = req.query.sortBy as sortBy;
   const validSortByValues = [ 'createdAt', 'rating', 'updatedAt' ];

   return {
      propertyId: req.params.propertyId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy,
      sortOrder: validSortByValues.includes(sortBy) ? (req.query.sortOrder as sortOrder) : sortOrder.desc,
      searchContent: req.query.searchContent as string,
      includeInvisible: req.query.includeInvisible === 'true'
   };
}

function prepareVisibilityUpdateInput (req: Request) {
   return {
      reviewId: req.params.reviewId,
      visibility: req.body.visibility
   };
}

// --- Controller: Get Public Reviews ---

export const getPublicReviewsController = async (req: Request, res: Response) => {
   try {
      const filter = parseQueryParams(req);

      const result = await getReviewsPublic(filter);

      return res.status(200).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};

// --- Controller: Get Owner Reviews ---

export const getOwnerReviewsController = async (req: Request, res: Response) => {
   try {
      const OwnerId = getUserIdFromRequest(req);
      const filter = parseQueryParams(req);

      const result = await getReviewsForOwner({ ...filter, OwnerId } as GetReviewsFilterForOwner);

      return res.status(200).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};

// --- Controller: Update Review Visibility ---

export const updateReviewVisibilityController = async (req: Request, res: Response) => {
   try {
      const ownerId = getUserIdFromRequest(req);
      const { reviewId, visibility } = prepareVisibilityUpdateInput(req);

      const result = await updateReviewVisibility(ownerId, reviewId, visibility);

      return res.status(200).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};
