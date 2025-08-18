// controllers/reviewController.ts
import { Request, Response } from 'express';
import { createReview, replyToReview } from '../../service/reviewService/reviewService';
import z, { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index';
import {
   safeParseCreateReview,
   safeParseReplyToReview,
   safeParseReplyToReviewBody
} from '../../validations/reviewValidation'; // Import safeParse functions

// --- Helper Functions (Each <15 lines) ---

function getUserIdFromRequest (req: Request): string {
   const userId = req.user?.userId;
   if (!userId) {
      throw new Error('AUTH_REQUIRED');
   }
   return userId;
}

function handleError (res: Response, error: any): Response {
   console.error('Error in review controller:', error);

   if (error instanceof ZodError) {
      // Use .flatten() for a simpler error structure, or .format() for nested paths
      const flatErrors = z.treeifyError(error);
      return res.status(400).json({
         error: 'Invalid input data.',
         // Provide structured error details in development
         details: NODE_ENV === 'development' ? flatErrors : undefined
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

export const createReviewController = async (req: Request, res: Response) => {
   try {
      const userId = getUserIdFromRequest(req);

      // 1. Prepare raw input data
      const rawInputData = {
         ...req.body,
         userId // Add authenticated user ID
      };

      // 2. Validate input using Zod's safeParse
      const validationResult = safeParseCreateReview(rawInputData);

      // 3. Check if validation failed
      if (!validationResult.success) {
         // If validation failed, pass the ZodError to handleError
         throw validationResult.error;
      }

      // 4. If successful, use the validated and typed data
      const validatedInputData = validationResult.data;

      // 5. Proceed with service logic
      const result = await createReview(validatedInputData);

      return res.status(201).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};

// --- Controller: Owner Replies to Review ---

export const replyToReviewController = async (req: Request, res: Response) => {
   try {
      const ownerId = getUserIdFromRequest(req);
      const reviewId = req.params.reviewId; // Get reviewId from URL path

      // Check if reviewId is present in the path
      if (!reviewId) {
         throw new Error('REVIEW_ID_REQUIRED_IN_PATH');
      }

      // 1. Prepare raw body data (only content should be here)
      const rawBodyData = {
         ...req.body // This should contain 'content'
      };

      // 2. Validate ONLY the body content using the new schema helper
      const validationResult = safeParseReplyToReviewBody(rawBodyData);

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
      const result = await replyToReview(serviceInputData);

      return res.status(200).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};
