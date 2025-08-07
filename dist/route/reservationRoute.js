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
const router = express_1.default.Router();
const uploadFile = (0, uploader_1.memoryUploader)().single('file');
// Reservation routes
// POST /reservation - Create a new reservation
router.post('/', authMwr_1.authUser, reservationController_1.createReservationController);
router.post('/:reservationId/cancel', authMwr_1.authUser, reservationController_1.cancelReservationController);
router.post('/:reservationId/upload-payment', authMwr_1.authUser, uploadFile, paymentProofController_1.uploadPayment);
exports.default = router;
