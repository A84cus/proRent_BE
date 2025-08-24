import express from 'express';
import {
   cancelExpiredReservationsController,
   sendBookingReminderByReservationIdController,
   sendBookingReminderController
} from '../controller/reservationController/reservationController';
import * as cronJobController from '../controller/report/reportCronJobController';
import { authOwner } from '../middleware';

const router = express.Router();

// reportHelper routes
router.post('/recalculate-all', cronJobController.prewarmReportsController);

// Reservation routes
router.post('/cancel-expired', cancelExpiredReservationsController);
router.post('/send-booking-reminder', sendBookingReminderController);
router.post('/:reservationId/send', sendBookingReminderByReservationIdController);

export default router;
