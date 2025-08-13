// controllers/reservationController.ts
import { Request, Response } from 'express';
import { cancelReservation, createReservation } from '../../service/reservationService/reservationService';
import { cancelExpiredReservations } from '../../service/reservationService/reservationExpiryService'; // Import the new service
import { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index'; // Import your env config
import {
   confirmReservationByOwner,
   rejectReservationByOwner
} from '../../service/reservationService/reservationManagementService';

function getSuccessStatusCode (isXendit: boolean): number {
   return isXendit ? 201 : 201;
}

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

export const cancelReservationController = async (req: Request, res: Response) => {
   try {
      const userId = getUserIdFromRequest(req);
      const { reservationId } = req.params;

      if (!reservationId) {
         return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
      }

      const updatedReservation = await cancelReservation(reservationId, userId);

      return res.status(200).json({
         message: 'Reservation cancelled successfully.',
         reservation: updatedReservation
      });
   } catch (error: any) {
      console.error('Error in cancelReservationController:', error);
      handleError(res, error);
   }
};

// --- New Controller Function ---
export const cancelExpiredReservationsController = async (req: Request, res: Response) => {
   try {
      console.log('Manual trigger: Running reservation expiry check...');

      const result = await cancelExpiredReservations();

      return res.status(200).json({
         message: `Reservation expiry check completed. ${result.cancelledReservationIds.length} reservation(s) cancelled.`,
         cancelledReservations: result.cancelledReservationIds
      });
   } catch (error: any) {
      console.error('Error in cancelExpiredReservationsController:', error);

      if (error.message) {
         return res.status(500).json({ error: 'Failed to process expired reservations.', details: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred while processing expired reservations.' });
   }
};

// --- NEW CONTROLLER FUNCTIONS FOR OWNER ACTIONS ---

// --- Controller for Owner to Reject a Reservation ---
export const rejectReservationByOwnerController = async (req: Request, res: Response) => {
   try {
      const ownerId = getUserIdFromRequest(req);

      const { reservationId } = req.params;
      if (!reservationId) {
         return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
      }

      const updatedReservation = await rejectReservationByOwner(reservationId, ownerId);

      return res.status(200).json({
         message: 'Reservation rejected successfully. Status changed to PENDING_PAYMENT.',
         reservation: updatedReservation
      });
   } catch (error: any) {
      console.error('Error in rejectReservationByOwnerController:', error);
      handleError(res, error);
   }
};

export const confirmReservationByOwnerController = async (req: Request, res: Response) => {
   try {
      const ownerId = getUserIdFromRequest(req);

      const { reservationId } = req.params;
      if (!reservationId) {
         return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
      }

      const updatedReservation = await confirmReservationByOwner(reservationId, ownerId);

      return res.status(200).json({
         message: 'Reservation confirmed successfully.',
         reservation: updatedReservation
      });
   } catch (error: any) {
      console.error('Error in confirmReservationByOwnerController:', error);
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
      return res.status(400).json({ error: error.message });
   }
   return res.status(500).json({
      error: 'An unexpected error occurred while creating the reservation.'
   });
}
