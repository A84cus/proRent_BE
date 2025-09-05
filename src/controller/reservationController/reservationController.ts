// controllers/reservationController.ts
import { Request, Response } from 'express';
import { createReservation } from '../../service/reservationService/reservationService';
import { cancelExpiredReservations } from '../../service/reservationService/reservationExpiryService'; // Import the new service
import { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index'; // Import your env config
import {
   cancelReservation,
   confirmReservationByOwner,
   rejectReservationByOwner
} from '../../service/reservationService/reservationManagementService';
import { RESERVATION_ERROR_MESSAGES, RESERVATION_SUCCESS_MESSAGES } from '../../constants/controllers/reservation';
import { sendBookingReminderForTomorrow } from '../../service/reservationService/reservationReminderService';

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
      const role = getRoleFromRequest(req);
      const { reservationId } = req.params;

      if (!reservationId) {
         return res.status(400).json({
            error: RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
         });
      }

      const updatedReservation = await cancelReservation(reservationId, userId, role);

      return res.status(200).json({
         message: RESERVATION_SUCCESS_MESSAGES.RESERVATION_CANCELLED,
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
      const result = await cancelExpiredReservations();

      return res.status(200).json({
         message: `${RESERVATION_SUCCESS_MESSAGES.RESERVATION_EXPIRY_CHECK_COMPLETED} ${result.cancelledReservationIds.length} reservation(s) cancelled.`,
         cancelledReservations: result.cancelledReservationIds
      });
   } catch (error: any) {
      console.error('Error in cancelExpiredReservationsController:', error);

      if (error.message) {
         return res.status(500).json({
            error: RESERVATION_ERROR_MESSAGES.FAILED_TO_PROCESS_EXPIRED,
            details: error.message
         });
      }
      return res.status(500).json({
         error: RESERVATION_ERROR_MESSAGES.UNEXPECTED_ERROR_PROCESSING_EXPIRED
      });
   }
};

// --- NEW CONTROLLER FUNCTIONS FOR OWNER ACTIONS ---

// --- Controller for Owner to Reject a Reservation ---
export const rejectReservationByOwnerController = async (req: Request, res: Response) => {
   try {
      const ownerId = getUserIdFromRequest(req);

      const { reservationId } = req.params;
      if (!reservationId) {
         return res.status(400).json({
            error: RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
         });
      }

      const updatedReservation = await rejectReservationByOwner(reservationId, ownerId);

      return res.status(200).json({
         message: RESERVATION_SUCCESS_MESSAGES.RESERVATION_REJECTED,
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
         return res.status(400).json({
            error: RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
         });
      }

      const updatedReservation = await confirmReservationByOwner(reservationId, ownerId);

      return res.status(200).json({
         message: RESERVATION_SUCCESS_MESSAGES.RESERVATION_CONFIRMED,
         reservation: updatedReservation
      });
   } catch (error: any) {
      console.error('Error in confirmReservationByOwnerController:', error);
      handleError(res, error);
   }
};

export const sendBookingReminderController = async (req: Request, res: Response) => {
   try {
      const result = await sendBookingReminderForTomorrow();

      return res.status(200).json({
         message: `Booking reminder job completed successfully.`,
         remindersSent: result.count,
         success: result.success
      });
   } catch (error: any) {
      console.error('Error in sendBookingReminderController:', error);

      if (error.message) {
         return res.status(500).json({
            error: 'Failed to send booking reminders.',
            details: error.message
         });
      }
      return res.status(500).json({
         error: 'An unexpected error occurred while sending booking reminders.'
      });
   }
};

// Add this import if you created the manual trigger function
import { sendBookingReminderByReservationId } from '../../service/reservationService/reservationReminderService';
import { getRoleFromRequest, getUserIdFromRequest, handleError, prepareInputData } from './reservationHelperController';
import { get } from 'http';

// --- Controller for Sending Booking Reminder for Specific Reservation ---
export const sendBookingReminderByReservationIdController = async (req: Request, res: Response) => {
   try {
      const { reservationId } = req.params;

      if (!reservationId) {
         return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
      }

      const result = await sendBookingReminderByReservationId(reservationId);

      return res.status(200).json({
         message: `Booking reminder sent successfully for reservation ${reservationId}.`,
         reservationId: result.reservationId,
         success: result.success
      });
   } catch (error: any) {
      console.error('Error in sendBookingReminderByReservationIdController:', error);

      if (error.message === 'Reservation not found') {
         return res.status(404).json({ error: 'Reservation not found.' });
      }

      if (error.message === 'User email not found for reservation') {
         return res.status(400).json({ error: 'User email not found for this reservation.' });
      }

      if (error.message) {
         return res.status(500).json({
            error: 'Failed to send booking reminder.',
            details: error.message
         });
      }
      return res.status(500).json({
         error: 'An unexpected error occurred while sending booking reminder.'
      });
   }
};
