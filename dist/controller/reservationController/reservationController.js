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
exports.sendBookingReminderController = exports.confirmReservationByOwnerController = exports.rejectReservationByOwnerController = exports.cancelExpiredReservationsController = exports.cancelReservationController = exports.createReservationController = void 0;
const reservationService_1 = require("../../service/reservationService/reservationService");
const reservationExpiryService_1 = require("../../service/reservationService/reservationExpiryService"); // Import the new service
const zod_1 = require("zod");
const index_1 = require("../../config/index"); // Import your env config
const reservationManagementService_1 = require("../../service/reservationService/reservationManagementService");
const reservationReminderService_1 = require("../../service/reservationService/reservationReminderService");
function getSuccessStatusCode(isXendit) {
    return isXendit ? 201 : 201;
}
const createReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromRequest(req);
        const inputData = prepareInputData(req, userId);
        const result = yield (0, reservationService_1.createReservation)(inputData);
        const isXendit = inputData.paymentType === 'XENDIT';
        return res.status(getSuccessStatusCode(isXendit)).json(result);
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.createReservationController = createReservationController;
const cancelReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromRequest(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
        }
        const updatedReservation = yield (0, reservationService_1.cancelReservation)(reservationId, userId);
        return res.status(200).json({
            message: 'Reservation cancelled successfully.',
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in cancelReservationController:', error);
        handleError(res, error);
    }
});
exports.cancelReservationController = cancelReservationController;
// --- New Controller Function ---
const cancelExpiredReservationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Manual trigger: Running reservation expiry check...');
        const result = yield (0, reservationExpiryService_1.cancelExpiredReservations)();
        return res.status(200).json({
            message: `Reservation expiry check completed. ${result.cancelledReservationIds.length} reservation(s) cancelled.`,
            cancelledReservations: result.cancelledReservationIds
        });
    }
    catch (error) {
        console.error('Error in cancelExpiredReservationsController:', error);
        if (error.message) {
            return res.status(500).json({ error: 'Failed to process expired reservations.', details: error.message });
        }
        return res.status(500).json({ error: 'An unexpected error occurred while processing expired reservations.' });
    }
});
exports.cancelExpiredReservationsController = cancelExpiredReservationsController;
// --- NEW CONTROLLER FUNCTIONS FOR OWNER ACTIONS ---
// --- Controller for Owner to Reject a Reservation ---
const rejectReservationByOwnerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = getUserIdFromRequest(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
        }
        const updatedReservation = yield (0, reservationManagementService_1.rejectReservationByOwner)(reservationId, ownerId);
        return res.status(200).json({
            message: 'Reservation rejected successfully. Status changed to PENDING_PAYMENT.',
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in rejectReservationByOwnerController:', error);
        handleError(res, error);
    }
});
exports.rejectReservationByOwnerController = rejectReservationByOwnerController;
const confirmReservationByOwnerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = getUserIdFromRequest(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            return res.status(400).json({ error: 'Reservation ID is required in the URL path.' });
        }
        const updatedReservation = yield (0, reservationManagementService_1.confirmReservationByOwner)(reservationId, ownerId);
        return res.status(200).json({
            message: 'Reservation confirmed successfully.',
            reservation: updatedReservation
        });
    }
    catch (error) {
        console.error('Error in confirmReservationByOwnerController:', error);
        handleError(res, error);
    }
});
exports.confirmReservationByOwnerController = confirmReservationByOwnerController;
const sendBookingReminderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Manual trigger: Running booking reminder job...');
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
// --- Refactored helper functions (each < 15 lines) ---
function getUserIdFromRequest(req) {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new Error('AUTH_REQUIRED');
    }
    return userId;
}
function prepareInputData(req, userId) {
    return Object.assign(Object.assign({}, req.body), { userId });
}
function handleError(res, error) {
    var _a;
    console.error('Error in createReservationController:', error);
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Invalid input data.',
            details: index_1.NODE_ENV === 'development' ? error : undefined
        });
    }
    if (error.message === 'AUTH_REQUIRED') {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Xendit payment setup failed')) {
        return res.status(500).json({ error: error.message });
    }
    if (error.message) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
        error: 'An unexpected error occurred while creating the reservation.'
    });
}
