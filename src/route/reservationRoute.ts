import express from 'express';
import {
   createReservationController,
   cancelReservationController
} from '../controller/reservationController/reservationController';

import { uploadPayment } from '../controller/reservationController/paymentProofController';
import { authUser } from '../middleware/authMwr';
import { multipleFileDiffField, multipleFileSameField, memoryUploader, validateImageFile } from '../utils/uploader';
import {
   getPropertyReservationsHandler,
   getReservations,
   getTenantReservationsHandler,
   getUserReservationsHandler
} from '../controller/reservationController/reservationQueryController';

const router = express.Router();

const uploadFile = memoryUploader().single('file');

// Reservation routes
router.get('/', getReservations); // General query
router.get('/user/:userId?', getUserReservationsHandler); // For a specific user or current user
router.get('/tenant/:propertyOwnerId?', getTenantReservationsHandler); // Property owner reservations
router.get('/property/:propertyId', getPropertyReservationsHandler); // Reservations for a specific property
// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);
router.post('/:reservationId/cancel', authUser, cancelReservationController);
router.post('/:reservationId/upload-payment', authUser, uploadFile, uploadPayment);

export default router;
