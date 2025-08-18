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
exports.getReservations = getReservations;
exports.getUserReservationsHandler = getUserReservationsHandler;
exports.getOwnerReservationsHandler = getOwnerReservationsHandler;
exports.getPropertyReservationsHandler = getPropertyReservationsHandler;
exports.getReservationWithPaymentHandler = getReservationWithPaymentHandler;
const reservationQueryService_1 = require("../../service/reservationService/reservationQueryService");
const reservation_1 = require("../../constants/controllers/reservation");
const system_1 = require("../../constants/controllers/system");
// Main query endpoint
function getReservations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, propertyOwnerId, propertyId, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", status, startDate, endDate, search, minAmount, maxAmount, } = req.query;
            const filters = {};
            if (status) {
                filters.status = status;
            }
            if (startDate) {
                filters.startDate = new Date(startDate);
            }
            if (endDate) {
                filters.endDate = new Date(endDate);
            }
            if (search) {
                filters.search = search;
            }
            if (minAmount !== undefined) {
                filters.minAmount = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                filters.maxAmount = Number(maxAmount);
            }
            const options = {
                userId: userId,
                propertyOwnerId: propertyOwnerId,
                propertyId: propertyId,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sortBy: sortBy,
                sortOrder: sortOrder,
                filters,
            };
            const result = yield (0, reservationQueryService_1.queryReservations)(options);
            res.json(result);
            return;
        }
        catch (error) {
            console.error("Error fetching reservations:", error);
            res
                .status(500)
                .json({ message: system_1.SYSTEM_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    });
}
// Get reservations by user ID
function getUserReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            // Remove the parameter check since we always expect userId from token
            if (!userId) {
                res
                    .status(400)
                    .json({ message: reservation_1.RESERVATION_ERROR_MESSAGES.USER_ID_REQUIRED });
                return;
            }
            const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", status, startDate, endDate, search, minAmount, maxAmount, } = req.query;
            const filters = {};
            if (status) {
                filters.status = status;
            }
            if (startDate) {
                filters.startDate = new Date(startDate);
            }
            if (endDate) {
                filters.endDate = new Date(endDate);
            }
            if (search) {
                filters.search = search;
            }
            if (minAmount !== undefined) {
                filters.minAmount = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                filters.maxAmount = Number(maxAmount);
            }
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sortBy: sortBy,
                sortOrder: sortOrder,
                filters,
            };
            const result = yield (0, reservationQueryService_1.getUserReservations)(userId, options);
            res.json(result);
            return;
        }
        catch (error) {
            console.error("Error in controller:", error);
            res
                .status(500)
                .json({ message: system_1.SYSTEM_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    });
}
// Get reservations for a property owner (tenant)
function getOwnerReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const propertyOwnerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!propertyOwnerId) {
                res
                    .status(400)
                    .json({
                    message: reservation_1.RESERVATION_ERROR_MESSAGES.PROPERTY_OWNER_ID_REQUIRED,
                });
                return;
            }
            const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", status, startDate, endDate, search, minAmount, maxAmount, } = req.query;
            const filters = {};
            if (status) {
                filters.status = status;
            }
            if (startDate) {
                filters.startDate = new Date(startDate);
            }
            if (endDate) {
                filters.endDate = new Date(endDate);
            }
            if (search) {
                filters.search = search;
            }
            if (minAmount !== undefined) {
                filters.minAmount = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                filters.maxAmount = Number(maxAmount);
            }
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sortBy: sortBy,
                sortOrder: sortOrder,
                filters,
            };
            const result = yield (0, reservationQueryService_1.getOwnerReservations)(propertyOwnerId, options);
            res.json(result);
            return;
        }
        catch (error) {
            console.error("Error fetching tenant reservations:", error);
            res
                .status(500)
                .json({ message: system_1.SYSTEM_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    });
}
// Get reservations for a specific property
function getPropertyReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                res
                    .status(400)
                    .json({ message: reservation_1.RESERVATION_ERROR_MESSAGES.PROPERTY_ID_REQUIRED });
                return;
            }
            const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", status, startDate, endDate, search, minAmount, maxAmount, } = req.query;
            const filters = {};
            if (status) {
                filters.status = status;
            }
            if (startDate) {
                filters.startDate = new Date(startDate);
            }
            if (endDate) {
                filters.endDate = new Date(endDate);
            }
            if (search) {
                filters.search = search;
            }
            if (minAmount !== undefined) {
                filters.minAmount = Number(minAmount);
            }
            if (maxAmount !== undefined) {
                filters.maxAmount = Number(maxAmount);
            }
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sortBy: sortBy,
                sortOrder: sortOrder,
                filters,
            };
            const result = yield (0, reservationQueryService_1.getPropertyReservations)(propertyId, options);
            res.json(result);
            return;
        }
        catch (error) {
            console.error("Error fetching property reservations:", error);
            res
                .status(500)
                .json({ message: system_1.SYSTEM_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    });
}
function getReservationWithPaymentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reservationId = req.params.id;
            if (!reservationId) {
                res
                    .status(400)
                    .json({ message: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED });
                return;
            }
            const reservationWithPayment = yield (0, reservationQueryService_1.getReservationWithPayment)(reservationId);
            if (!reservationWithPayment) {
                res
                    .status(404)
                    .json({ message: reservation_1.RESERVATION_ERROR_MESSAGES.RESERVATION_NOT_FOUND });
                return;
            }
            res.json(reservationWithPayment);
            return;
        }
        catch (error) {
            console.error("Error fetching reservation with payment:", error);
            res
                .status(500)
                .json({ message: system_1.SYSTEM_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
            // Atau jika ingin lebih spesifik (hati-hati dengan informasi sensitif):
            // return res.status(500).json({ message: 'Failed to fetch reservation details', error: error.message });
        }
    });
}
