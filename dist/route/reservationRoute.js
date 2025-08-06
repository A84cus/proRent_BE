"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservationController_1 = require("../controller/reservationController/reservationController");
const authMwr_1 = require("../middleware/authMwr");
const router = express_1.default.Router();
// Reservation routes
// POST /reservation - Create a new reservation
router.post('/', authMwr_1.authUser, reservationController_1.createReservationController);
router.post('/cancel', authMwr_1.authUser, reservationController_1.cancelReservationController);
exports.default = router;
