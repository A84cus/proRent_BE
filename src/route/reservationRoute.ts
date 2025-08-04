import express from 'express';
import { createReservationController } from '../controller/reservationController/reservationController';
import { authUser } from '../middleware/authMwr';

const router = express.Router();

// Reservation routes

// POST /reservation - Create a new reservation
router.post('/', authUser, createReservationController);

export default router;
