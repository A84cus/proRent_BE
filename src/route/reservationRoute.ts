import express from 'express';
import {
   createReservationController,
   cancelReservationController
} from '../controller/reservationController/reservationController';
import { uploadPayment } from '../controller/reservationController/paymentProofController';
import { authUser } from '../middleware/authMwr';
import { multipleFileDiffField, multipleFileSameField, memoryUploader, validateImageFile } from '../utils/uploader';

const router = express.Router();

const uploadFile = memoryUploader().single('file');

// Reservation routes

// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);
router.post('/:reservationId/cancel', authUser, cancelReservationController);
router.post('/:reservationId/upload-payment', authUser, uploadFile, uploadPayment);

export default router;
