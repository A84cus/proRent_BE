"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromRequest = getUserIdFromRequest;
exports.getRoleFromRequest = getRoleFromRequest;
exports.prepareInputData = prepareInputData;
exports.handleError = handleError;
const zod_1 = require("zod");
const index_1 = require("../../config/index"); // Import your env config
const reservation_1 = require("../../constants/controllers/reservation");
const constants_1 = require("../../constants");
function getUserIdFromRequest(req) {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new Error('AUTH_REQUIRED');
    }
    return userId;
}
function getRoleFromRequest(req) {
    var _a;
    const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!role) {
        throw new Error(constants_1.USER_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    }
    return role;
}
function prepareInputData(req, userId) {
    return Object.assign(Object.assign({}, req.body), { userId });
}
function handleError(res, error) {
    var _a;
    console.error('Error in createReservationController:', error);
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: reservation_1.RESERVATION_ERROR_MESSAGES.INVALID_INPUT_DATA,
            details: index_1.NODE_ENV === 'development' ? error : undefined
        });
    }
    if (error.message === 'AUTH_REQUIRED') {
        return res.status(401).json({ error: reservation_1.RESERVATION_ERROR_MESSAGES.AUTH_REQUIRED });
    }
    if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Xendit payment setup failed')) {
        return res.status(500).json({ error: error.message });
    }
    if (error.message) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
        error: reservation_1.RESERVATION_ERROR_MESSAGES.CREATE_RESERVATION_ERROR
    });
}
