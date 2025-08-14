import express from 'express';
import {
   createReservationController,
   cancelReservationController,
   cancelExpiredReservationsController,
   rejectReservationByOwnerController,
   confirmReservationByOwnerController
} from '../controller/reservationController/reservationController';

import { uploadPayment } from '../controller/reservationController/paymentProofController';
import { authUser, authOwner, authAny } from '../middleware/authMwr';
import { multipleFileDiffField, multipleFileSameField, memoryUploader, validateImageFile } from '../utils/uploader';
import {
   getPropertyReservationsHandler,
   getReservations,
   getReservationWithPaymentHandler,
   getOwnerReservationsHandler,
   getUserReservationsHandler
} from '../controller/reservationController/reservationQueryController';

const router = express.Router();

const uploadFile = memoryUploader().single('file');

// Reservation routes
router.get('/', getReservations);
router.get('/user', authUser, getUserReservationsHandler);
router.get('/owner', authOwner, getOwnerReservationsHandler);
router.get('/:id', authAny, getReservationWithPaymentHandler);
router.get('/property/:propertyId', getPropertyReservationsHandler);
// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);
router.post('/cancel-expired', cancelExpiredReservationsController);
router.post('/:reservationId/cancel', authAny, cancelReservationController);
router.patch('/:reservationId/reject', authOwner, rejectReservationByOwnerController);
router.patch('/:reservationId/confirm', authOwner, confirmReservationByOwnerController);
router.patch('/:reservationId/upload-payment', authUser, uploadFile, uploadPayment);

export default router;
