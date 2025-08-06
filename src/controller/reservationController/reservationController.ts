// controllers/reservationController.ts
import { Request, Response } from 'express';
import { createReservation } from '../../service/reservationService/reservationService';
import { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index'; // Import your env config

// --- Helper function to determine success status code ---
function getSuccessStatusCode (isXendit: boolean): number {
   return isXendit ? 201 : 201; // Both cases result in 201 Created
   // If Xendit required redirect (303), logic would differ slightly
}

// --- Main controller function ---
export const createReservationController = async (req: Request, res: Response) => {
   try {
      const userId = getUserIdFromRequest(req);
      const inputData = prepareInputData(req, userId);
      const result = await createReservation(inputData);
      const isXendit = inputData.paymentType === 'XENDIT';

      return res.status(getSuccessStatusCode(isXendit)).json(result);
   } catch (error: any) {
      handleError(res, error);
   }
};

// --- Refactored helper functions (each < 15 lines) ---

function getUserIdFromRequest (req: Request): string {
   const userId = req.user?.userId;
   if (!userId) {
      throw new Error('AUTH_REQUIRED');
   }
   return userId;
}

function prepareInputData (req: Request, userId: string): any {
   return {
      ...req.body,
      userId
   };
}

function handleError (res: Response, error: any): Response {
   console.error('Error in createReservationController:', error);

   if (error instanceof ZodError) {
      return res.status(400).json({
         error: 'Invalid input data.',
         details: NODE_ENV === 'development' ? error : undefined
      });
   }

   if (error.message === 'AUTH_REQUIRED') {
      return res.status(401).json({ error: 'Authentication required.' });
   }

   if (error.message?.includes('Xendit payment setup failed')) {
      return res.status(500).json({ error: error.message });
   }

   if (error.message) {
      // Assume other service errors are client-related (e.g., unavailable)
      return res.status(400).json({ error: error.message });
   }

   return res.status(500).json({
      error: 'An unexpected error occurred while creating the reservation.'
   });
}
