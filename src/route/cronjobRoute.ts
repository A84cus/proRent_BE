import express from 'express';
import {
   cancelExpiredReservationsController,
   sendBookingReminderByReservationIdController,
   sendBookingReminderController
} from '../controller/reservationController/reservationController';

const router = express.Router();

// Reservation routes
router.post('/cancel-expired', cancelExpiredReservationsController);
router.post('/send-booking-reminder', sendBookingReminderController);
router.post('/:reservationId/send', sendBookingReminderByReservationIdController);

export default router;
