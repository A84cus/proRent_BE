"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingReminderByReservationIdController = exports.sendBookingReminderController = exports.confirmReservationByOwnerController = exports.rejectReservationByOwnerController = exports.cancelExpiredReservationsController = exports.cancelReservationController = exports.createReservationController = void 0;
const reservationService_1 = require("../../service/reservationService/reservationService");
const reservationExpiryService_1 = require("../../service/reservationService/reservationExpiryService"); // Import the new service
const reservationManagementService_1 = require("../../service/reservationService/reservationManagementService");
const reservation_1 = require("../../constants/controllers/reservation");
const reservationReminderService_1 = require("../../service/reservationService/reservationReminderService");
function getSuccessStatusCode(isXendit) {
    return isXendit ? 201 : 201;
}
const createReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, reservationHelperController_1.getUserIdFromRequest)(req);
        const inputData = (0, reservationHelperController_1.prepareInputData)(req, userId);
        const result = yield (0, reservationService_1.createReservation)(inputData);
        const isXendit = inputData.paymentType === 'XENDIT';
        return res.status(getSuccessStatusCode(isXendit)).json(result);
    }
    catch (error) {
        (0, reservationHelperController_1.handleError)(res, error);
    }
});
exports.createReservationController = createReservationController;
const cancelReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, reservationHelperController_1.getUserIdFromRequest)(req);
        const role = (0, reservationHelperController_1.getRoleFromRequest)(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
            });
        }
        const updatedReservation = yield (0, reservationManagementService_1.cancelReservation)(reservationId, userId, role);
        return res.status(200).json({
            message: reservation_1.RESERVATION_SUCCESS_MESSAGES.RESERVATION_CANCELLED,
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in cancelReservationController:', error);
        (0, reservationHelperController_1.handleError)(res, error);
    }
});
exports.cancelReservationController = cancelReservationController;
// --- New Controller Function ---
const cancelExpiredReservationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, reservationExpiryService_1.cancelExpiredReservations)();
        return res.status(200).json({
            message: `${reservation_1.RESERVATION_SUCCESS_MESSAGES.RESERVATION_EXPIRY_CHECK_COMPLETED} ${result.cancelledReservationIds.length} reservation(s) cancelled.`,
            cancelledReservations: result.cancelledReservationIds
        });
    }
    catch (error) {
        console.error('Error in cancelExpiredReservationsController:', error);
        if (error.message) {
            return res.status(500).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.FAILED_TO_PROCESS_EXPIRED,
                details: error.message
            });
        }
        return res.status(500).json({
            error: reservation_1.RESERVATION_ERROR_MESSAGES.UNEXPECTED_ERROR_PROCESSING_EXPIRED
        });
    }
});
exports.cancelExpiredReservationsController = cancelExpiredReservationsController;
// --- NEW CONTROLLER FUNCTIONS FOR OWNER ACTIONS ---
// --- Controller for Owner to Reject a Reservation ---
const rejectReservationByOwnerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = (0, reservationHelperController_1.getUserIdFromRequest)(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
            });
        }
        const updatedReservation = yield (0, reservationManagementService_1.rejectReservationByOwner)(reservationId, ownerId);
        return res.status(200).json({
            message: reservation_1.RESERVATION_SUCCESS_MESSAGES.RESERVATION_REJECTED,
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in rejectReservationByOwnerController:', error);
        (0, reservationHelperController_1.handleError)(res, error);
    }
});
exports.rejectReservationByOwnerController = rejectReservationByOwnerController;
const confirmReservationByOwnerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = (0, reservationHelperController_1.getUserIdFromRequest)(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
            });
        }
        const updatedReservation = yield (0, reservationManagementService_1.confirmReservationByOwner)(reservationId, ownerId);
        return res.status(200).json({
            message: reservation_1.RESERVATION_SUCCESS_MESSAGES.RESERVATION_CONFIRMED,
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in confirmReservationByOwnerController:', error);
        (0, reservationHelperController_1.handleError)(res, error);
    }
});
exports.confirmReservationByOwnerController = confirmReservationByOwnerController;
const sendBookingReminderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, reservationReminderService_1.sendBookingReminderForTomorrow)();
        return res.status(200).json({
            message: `Booking reminder job completed successfully.`,
            remindersSent: result.count,
            success: result.success
        });
    }
    catch (error) {
        console.error('Error in sendBookingReminderController:', error);
        if (error.message) {
            return res.status(500).json({
                error: 'Failed to send booking reminders.',
                details: error.message
            });
        }
        return res.status(500).json({
            error: 'An unexpected error occurred while sending booking reminders.'
        });
    }
});
exports.sendBookingReminderController = sendBookingReminderController;
// Add this import if you created the manual trigger function
const reservationReminderService_2 = require("../../service/reservationService/reservationReminderService");
const reservationHelperController_1 = require("./reservationHelperController");
// --- Controller for Sending Booking Reminder for Specific Reservation ---
const sendBookingReminderByReservationIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
        }
        const result = yield (0, reservationReminderService_2.sendBookingReminderByReservationId)(reservationId);
        return res.status(200).json({
            message: `Booking reminder sent successfully for reservation ${reservationId}.`,
            reservationId: result.reservationId,
            success: result.success
        });
    }
    catch (error) {
        console.error('Error in sendBookingReminderByReservationIdController:', error);
        if (error.message === 'Reservation not found') {
            return res.status(404).json({ error: 'Reservation not found.' });
        }
        if (error.message === 'User email not found for reservation') {
            return res.status(400).json({ error: 'User email not found for this reservation.' });
        }
        if (error.message) {
            return res.status(500).json({
                error: 'Failed to send booking reminder.',
                details: error.message
            });
        }
        return res.status(500).json({
            error: 'An unexpected error occurred while sending booking reminder.'
        });
    }
});
exports.sendBookingReminderByReservationIdController = sendBookingReminderByReservationIdController;
