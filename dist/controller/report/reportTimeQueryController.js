"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.calculateOccupancyByReservations = exports.getMostReservedMonth = exports.getRoomTypeSalesOverTime = exports.getPropertySalesOverTime = void 0;
const reportByTimeService = __importStar(require("../../service/report/reportByTimeService")); // Time series, occupancy, most reserved
const availabilityService_1 = require("../../service/reservationService/availabilityService"); // For validation
const reservationController_1 = require("../reservationController");
const reportHelperController_1 = require("./reportHelperController");
// --- Time Series Controllers ---
const getPropertySalesOverTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = (0, reservationController_1.getUserIdFromRequest)(req);
        const { propertyId } = req.params;
        const { period, startDate, endDate } = req.query;
        if (!period || !['year', 'month', 'day'].includes(period)) {
            return res
                .status(400)
                .json({ message: 'Query parameter "period" is required and must be "year", "month", or "day".' });
        }
        const parsedStartDate = (0, reportHelperController_1.parseDateParam)(startDate);
        const parsedEndDate = (0, reportHelperController_1.parseDateParam)(endDate);
        const filters = {
            startDate: parsedStartDate,
            endDate: parsedEndDate
        };
        const report = yield reportByTimeService.getPropertySalesOverTime(ownerId, propertyId, period, filters);
        return res.json(report);
    }
    catch (error) {
        console.error('Error fetching property sales over time:', error);
        // Specific error handling for ownership/security checks if needed
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('not found or does not belong')) {
            return res.status(404).json({ message: error.message });
        }
        return res
            .status(500)
            .json({ message: 'Internal server error while fetching property sales over time.', error: error.message });
    }
});
exports.getPropertySalesOverTime = getPropertySalesOverTime;
const getRoomTypeSalesOverTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = (0, reservationController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: Owner ID not found.' });
        }
        const { roomTypeId } = req.params;
        const { period, startDate, endDate } = req.query;
        if (!period || !['year', 'month', 'day'].includes(period)) {
            return res
                .status(400)
                .json({ message: 'Query parameter "period" is required and must be "year", "month", or "day".' });
        }
        const parsedStartDate = (0, reportHelperController_1.parseDateParam)(startDate);
        const parsedEndDate = (0, reportHelperController_1.parseDateParam)(endDate);
        const filters = {
            startDate: parsedStartDate,
            endDate: parsedEndDate
        };
        const report = yield reportByTimeService.getRoomTypeSalesOverTime(ownerId, roomTypeId, period, filters);
        return res.json(report);
    }
    catch (error) {
        console.error('Error fetching room type sales over time:', error);
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('not found or does not belong')) {
            return res.status(404).json({ message: error.message });
        }
        return res
            .status(500)
            .json({ message: 'Internal server error while fetching room type sales over time.', error: error.message });
    }
});
exports.getRoomTypeSalesOverTime = getRoomTypeSalesOverTime;
const getMostReservedMonth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = (0, reservationController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: Owner ID not found.' });
        }
        const { startDate, endDate } = req.query;
        const parsedStartDate = (0, reportHelperController_1.parseDateParam)(startDate);
        const parsedEndDate = (0, reportHelperController_1.parseDateParam)(endDate);
        const filters = {
            startDate: parsedStartDate,
            endDate: parsedEndDate
        };
        const result = yield reportByTimeService.getMostReservedMonth(ownerId, filters);
        return res.json(result); // Could be null
    }
    catch (error) {
        console.error('Error fetching most reserved month:', error);
        return res
            .status(500)
            .json({ message: 'Internal server error while fetching most reserved month.', error: error.message });
    }
});
exports.getMostReservedMonth = getMostReservedMonth;
const calculateOccupancyByReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomTypeIds, startDate, endDate } = req.body;
        if (!Array.isArray(roomTypeIds) || roomTypeIds.length === 0) {
            return res.status(400).json({ message: 'roomTypeIds must be a non-empty array in the request body.' });
        }
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res
                .status(400)
                .json({ message: 'startDate and endDate are required in the request body and must be strings.' });
        }
        const parsedStartDate = (0, reportHelperController_1.parseDateParam)(startDate);
        const parsedEndDate = (0, reportHelperController_1.parseDateParam)(endDate);
        if (!parsedStartDate || !parsedEndDate) {
            return res.status(400).json({ message: 'Invalid date format for startDate or endDate in the request body.' });
        }
        try {
            (0, availabilityService_1.generateDateRange)(parsedStartDate, parsedEndDate);
        }
        catch (rangeError) {
            return res.status(400).json({ message: rangeError.message });
        }
        const occupancyMap = yield reportByTimeService.calculateOccupancyByReservations(roomTypeIds, parsedStartDate, parsedEndDate);
        return res.json(occupancyMap);
    }
    catch (error) {
        console.error('Error calculating occupancy by reservations:', error);
        return res
            .status(500)
            .json({ message: 'Internal server error while calculating occupancy.', error: error.message });
    }
});
exports.calculateOccupancyByReservations = calculateOccupancyByReservations;
