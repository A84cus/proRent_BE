import express from 'express';
import {
   createReservationController,
   cancelReservationController
} from '../controller/reservationController/reservationController';

import { uploadPayment } from '../controller/reservationController/paymentProofController';
import { authUser, authTenant } from '../middleware/authMwr';
import { multipleFileDiffField, multipleFileSameField, memoryUploader, validateImageFile } from '../utils/uploader';
import {
   getPropertyReservationsHandler,
   getReservations,
   getOwnerReservationsHandler,
   getUserReservationsHandler
} from '../controller/reservationController/reservationQueryController';

const router = express.Router();

const uploadFile = memoryUploader().single('file');

// Reservation routes
router.get('/', getReservations);
router.get('/user/:userId', authUser, getUserReservationsHandler);
router.get('/owner/:propertyOwnerId', authTenant, getOwnerReservationsHandler);
router.get('/property/:propertyId', getPropertyReservationsHandler);
// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);
router.post('/:reservationId/cancel', authUser, cancelReservationController);
router.post('/:reservationId/upload-payment', authUser, uploadFile, uploadPayment);

export default router;
