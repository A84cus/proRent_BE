import express from 'express';
import {
   createReservationController,
   cancelReservationController
} from '../controller/reservationController/reservationController';

import { uploadPayment } from '../controller/reservationController/paymentProofController';
import { authUser, authTenant, authAny } from '../middleware/authMwr';
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
router.get('/owner', authTenant, getOwnerReservationsHandler);
router.get('/:id', authAny, getReservationWithPaymentHandler);
router.get('/property/:propertyId', getPropertyReservationsHandler);
// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);
router.post('/:reservationId/cancel', authUser, cancelReservationController);
router.patch('/:reservationId/upload-payment', authUser, uploadFile, uploadPayment);

export default router;
