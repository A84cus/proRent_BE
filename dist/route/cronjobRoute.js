"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservationController_1 = require("../controller/reservationController/reservationController");
const router = express_1.default.Router();
// Reservation routes
router.post('/cancel-expired', reservationController_1.cancelExpiredReservationsController);
router.post('/send-booking-reminder', reservationController_1.sendBookingReminderController);
router.post('/:reservationId/send', reservationController_1.sendBookingReminderByReservationIdController);
exports.default = router;
