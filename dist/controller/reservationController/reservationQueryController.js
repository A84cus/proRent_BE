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
const reservationQueryService_1 = require("../../service/reservationService/reservationQueryService");
// Main query endpoint
function getReservations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, propertyOwnerId, propertyId, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', status, startDate, endDate, search, minAmount, maxAmount } = req.query;
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
                filters
            };
            const result = yield (0, reservationQueryService_1.queryReservations)(options);
            return res.json(result);
        }
        catch (error) {
            console.error('Error fetching reservations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}
// Get reservations by user ID
function getUserReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = req.params.userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', status, startDate, endDate, search, minAmount, maxAmount } = req.query;
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
                filters
            };
            const result = yield (0, reservationQueryService_1.getUserReservations)(userId, options);
            return res.json(result);
        }
        catch (error) {
            console.error('Error fetching user reservations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}
// Get reservations for a property owner (tenant)
function getOwnerReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const propertyOwnerId = req.params.propertyOwnerId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            if (!propertyOwnerId) {
                return res.status(400).json({ message: 'Property owner ID is required' });
            }
            const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', status, startDate, endDate, search, minAmount, maxAmount } = req.query;
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
                filters
            };
            const result = yield (0, reservationQueryService_1.getOwnerReservations)(propertyOwnerId, options);
            return res.json(result);
        }
        catch (error) {
            console.error('Error fetching tenant reservations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}
// Get reservations for a specific property
function getPropertyReservationsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                return res.status(400).json({ message: 'Property ID is required' });
            }
            const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', status, startDate, endDate, search, minAmount, maxAmount } = req.query;
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
                filters
            };
            const result = yield (0, reservationQueryService_1.getPropertyReservations)(propertyId, options);
            return res.json(result);
        }
        catch (error) {
            console.error('Error fetching property reservations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}
