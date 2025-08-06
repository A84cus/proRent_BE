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
exports.createReservationController = void 0;
const reservationService_1 = require("../../service/reservationService/reservationService");
const zod_1 = require("zod");
const index_1 = require("../../config/index"); // Import your env config
// --- Helper function to determine success status code ---
function getSuccessStatusCode(isXendit) {
    return isXendit ? 201 : 201; // Both cases result in 201 Created
    // If Xendit required redirect (303), logic would differ slightly
}
// --- Main controller function ---
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
        // Assume other service errors are client-related (e.g., unavailable)
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
        error: 'An unexpected error occurred while creating the reservation.'
    });
}
