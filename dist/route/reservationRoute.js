"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservationController_1 = require("../controller/reservationController/reservationController");
const paymentProofController_1 = require("../controller/reservationController/paymentProofController");
const authMwr_1 = require("../middleware/authMwr");
const uploader_1 = require("../utils/uploader");
const reservationQueryController_1 = require("../controller/reservationController/reservationQueryController");
const router = express_1.default.Router();
const uploadFile = (0, uploader_1.memoryUploader)().single('file');
// Reservation routes
router.get('/', reservationQueryController_1.getReservations);
router.post('/cancel-expired', reservationController_1.cancelExpiredReservationsController);
router.get('/user', authMwr_1.authUser, reservationQueryController_1.getUserReservationsHandler);
router.get('/owner', authMwr_1.authOwner, reservationQueryController_1.getOwnerReservationsHandler);
router.get('/:id', authMwr_1.authAny, reservationQueryController_1.getReservationWithPaymentHandler);
router.get('/property/:propertyId', reservationQueryController_1.getPropertyReservationsHandler);
// POST /reservation - Create a new reservation
router.post('/', authMwr_1.authUser, reservationController_1.createReservationController);
router.post('/:reservationId/cancel', authMwr_1.authAny, reservationController_1.cancelReservationController);
router.patch('/:reservationId/reject', authMwr_1.authOwner, reservationController_1.rejectReservationByOwnerController);
router.patch('/:reservationId/confirm', authMwr_1.authOwner, reservationController_1.confirmReservationByOwnerController);
router.patch('/:reservationId/upload-payment', authMwr_1.authUser, uploadFile, paymentProofController_1.uploadPayment);
exports.default = router;
