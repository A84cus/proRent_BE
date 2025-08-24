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
exports.uploadPayment = void 0;
exports.getUserIdFromRequest = getUserIdFromRequest;
const uploadPaymentService_1 = require("../../service/reservationService/uploadPaymentService"); // Adjust path
const reservation_1 = require("../../constants/controllers/reservation");
const uploadPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = getUserIdFromRequest(req);
        const { reservationId } = req.params;
        if (!reservationId) {
            res.status(400).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL
            });
            return;
        }
        const uploadedFile = req.file;
        if (!uploadedFile) {
            res.status(400).json({
                error: reservation_1.RESERVATION_ERROR_MESSAGES.NO_FILE_UPLOADED
            });
            return;
        }
        // --- 2. Call the Service Layer ---
        // The service handles detailed validation, upload, and database updates.
        const updatedReservation = yield (0, uploadPaymentService_1.uploadPaymentProof)(reservationId, userId, uploadedFile);
        // --- 3. Send Success Response ---
        res.status(200).json({
            message: reservation_1.RESERVATION_SUCCESS_MESSAGES.PAYMENT_PROOF_UPLOADED,
            reservation: updatedReservation // Include updated details
        });
        return;
    }
    catch (error) {
        console.error('Error in uploadPaymentProofController:', error);
        // --- 4. Handle Errors ---
        if (isServiceAuthorizationOrStateError(error.message)) {
            res.status(400).json({ error: error.message });
            return;
        }
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.startsWith('File validation failed:')) {
            // Error message formatted by the service from Zod issues
            res.status(400).json({ error: error.message });
            return;
        }
        if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.startsWith('Failed to upload payment proof')) {
            // Error during Cloudinary interaction
            res.status(500).json({ error: error.message });
            return;
        }
        // Handle unexpected errors
        res.status(500).json({
            error: reservation_1.RESERVATION_ERROR_MESSAGES.PAYMENT_PROOF_UPLOAD_ERROR
        });
    }
});
exports.uploadPayment = uploadPayment;
function getUserIdFromRequest(req) {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new Error('AUTH_REQUIRED');
    }
    return userId;
}
function isServiceAuthorizationOrStateError(message) {
    return (message.includes('Reservation not found') ||
        message.includes('Unauthorized') ||
        message.includes('can only upload proof for your own') ||
        message.includes('Payment proof can only be uploaded for') ||
        message.includes('Payment proof upload is only allowed for') ||
        message.includes('Payment proof already uploaded'));
}
