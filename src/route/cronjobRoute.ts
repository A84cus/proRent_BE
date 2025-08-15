import express from 'express';
import {
   cancelExpiredReservationsController,
   sendBookingReminderController
} from '../controller/reservationController/reservationController';

const router = express.Router();

// Reservation routes
router.post('/cancel-expired', cancelExpiredReservationsController);
router.post('/send-booking-reminder', sendBookingReminderController);

export default router;
