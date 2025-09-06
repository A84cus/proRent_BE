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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = __importDefault(require("../BaseController"));
const responseHelper_1 = __importDefault(require("../../helpers/system/responseHelper"));
const peakRateService_1 = __importDefault(require("../../service/property/peakRateService"));
const publicPropertyService_1 = __importDefault(require("../../service/property/publicPropertyService"));
const property_1 = require("../../constants/controllers/property");
const moment_1 = __importDefault(require("moment"));
class RoomTypePricingController extends BaseController_1.default {
    /**
     * GET /api/rooms/:id/pricing/map - Get price map for calendar display
     */
    getPriceMap(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { year, month } = req.query;
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.ROOM_TYPE_ID_REQUIRED, undefined, 400);
                    return;
                }
                // Validate year and month
                const numYear = year
                    ? parseInt(year)
                    : new Date().getFullYear();
                const numMonth = month
                    ? parseInt(month)
                    : new Date().getMonth() + 1;
                if (isNaN(numYear) || isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
                    responseHelper_1.default.error(res, "Invalid year or month parameter", undefined, 400);
                    return;
                }
                // Get the first and last day of the month
                const startDate = (0, moment_1.default)(`${numYear}-${numMonth}-01`, "Asia/Jakarta").startOf("day");
                const endDate = startDate.clone().endOf("month");
                const priceMap = yield this.calculatePriceMapForDateRange(id, startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
                responseHelper_1.default.success(res, "Price map retrieved successfully", priceMap);
            }
            catch (error) {
                console.error("Error getting price map:", error);
                responseHelper_1.default.error(res, "Failed to get price map", undefined, 500);
            }
        });
    }
    /**
     * GET /api/rooms/:id/pricing/detailed - Get detailed pricing information
     */
    getDetailedPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { startDate, endDate } = req.query;
                if (!id || !startDate || !endDate) {
                    responseHelper_1.default.error(res, "Room type ID, start date, and end date are required", undefined, 400);
                    return;
                }
                const detailedPricing = yield this.calculateDetailedPricing(id, startDate, endDate);
                responseHelper_1.default.success(res, "Detailed pricing retrieved successfully", detailedPricing);
            }
            catch (error) {
                console.error("Error getting detailed pricing:", error);
                responseHelper_1.default.error(res, "Failed to get detailed pricing", undefined, 500);
            }
        });
    }
    /**
     * GET /api/rooms/:id/pricing/calculate - Calculate total price for date range
     */
    calculateTotalPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { startDate, endDate } = req.query;
                if (!id || !startDate || !endDate) {
                    responseHelper_1.default.error(res, "Room type ID, start date, and end date are required", undefined, 400);
                    return;
                }
                const detailedPricing = yield this.calculateDetailedPricing(id, startDate, endDate);
                const totalPrice = detailedPricing.reduce((sum, dayPrice) => sum + dayPrice.finalPrice, 0);
                const numberOfNights = detailedPricing.length;
                responseHelper_1.default.success(res, "Total price calculated successfully", {
                    totalPrice,
                    nightlyBreakdown: detailedPricing,
                    numberOfNights,
                });
            }
            catch (error) {
                console.error("Error calculating total price:", error);
                responseHelper_1.default.error(res, "Failed to calculate total price", undefined, 500);
            }
        });
    }
    /**
     * Helper method to calculate price map for date range
     */
    calculatePriceMapForDateRange(roomTypeId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const priceMap = {};
            try {
                // Get room type base price
                const roomType = yield publicPropertyService_1.default.getRoomTypeById(roomTypeId);
                if (!roomType) {
                    throw new Error("Room type not found");
                }
                const basePrice = parseFloat(roomType.basePrice);
                // Get all peak rates for this room type
                const peakRates = yield peakRateService_1.default.getPeakRatesByRoomTypePublic(roomTypeId);
                // Generate dates and calculate prices
                const start = (0, moment_1.default)(startDate, "Asia/Jakarta");
                const end = (0, moment_1.default)(endDate, "Asia/Jakarta");
                for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, "day")) {
                    const dateStr = date.format("YYYY-MM-DD");
                    // Check if this date has a peak rate
                    const applicablePeakRate = peakRates.find((peakRate) => {
                        const peakStart = (0, moment_1.default)(peakRate.startDate);
                        const peakEnd = (0, moment_1.default)(peakRate.endDate);
                        return (date.isSameOrAfter(peakStart, "day") &&
                            date.isSameOrBefore(peakEnd, "day"));
                    });
                    if (applicablePeakRate) {
                        // Calculate price with peak rate
                        if (applicablePeakRate.rateType === "FIXED") {
                            priceMap[dateStr] = parseFloat(applicablePeakRate.value.toString());
                        }
                        else {
                            // PERCENTAGE
                            priceMap[dateStr] =
                                basePrice +
                                    (basePrice * parseFloat(applicablePeakRate.value.toString())) /
                                        100;
                        }
                    }
                    else {
                        // Use base price
                        priceMap[dateStr] = basePrice;
                    }
                }
                return priceMap;
            }
            catch (error) {
                console.error("Error calculating price map:", error);
                throw error;
            }
        });
    }
    /**
     * Helper method to calculate detailed pricing
     */
    calculateDetailedPricing(roomTypeId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const pricingDetails = [];
            try {
                // Get room type base price
                const roomType = yield publicPropertyService_1.default.getRoomTypeById(roomTypeId);
                if (!roomType) {
                    throw new Error("Room type not found");
                }
                const basePrice = parseFloat(roomType.basePrice);
                // Get all peak rates for this room type
                const peakRates = yield peakRateService_1.default.getPeakRatesByRoomTypePublic(roomTypeId);
                // Generate dates and calculate prices
                const start = (0, moment_1.default)(startDate, "Asia/Jakarta");
                const end = (0, moment_1.default)(endDate, "Asia/Jakarta");
                for (let date = start.clone(); date.isBefore(end); date.add(1, "day")) {
                    const dateStr = date.format("YYYY-MM-DD");
                    // Check if this date has a peak rate
                    const applicablePeakRate = peakRates.find((peakRate) => {
                        const peakStart = (0, moment_1.default)(peakRate.startDate);
                        const peakEnd = (0, moment_1.default)(peakRate.endDate);
                        return (date.isSameOrAfter(peakStart, "day") &&
                            date.isSameOrBefore(peakEnd, "day"));
                    });
                    let finalPrice = basePrice;
                    let hasPeakRate = false;
                    let peakRateData = undefined;
                    if (applicablePeakRate) {
                        hasPeakRate = true;
                        peakRateData = applicablePeakRate;
                        if (applicablePeakRate.rateType === "FIXED") {
                            finalPrice = parseFloat(applicablePeakRate.value.toString());
                        }
                        else {
                            // PERCENTAGE
                            finalPrice =
                                basePrice +
                                    (basePrice * parseFloat(applicablePeakRate.value.toString())) /
                                        100;
                        }
                    }
                    pricingDetails.push({
                        date: dateStr,
                        basePrice,
                        finalPrice,
                        hasPeakRate,
                        peakRate: peakRateData,
                    });
                }
                return pricingDetails;
            }
            catch (error) {
                console.error("Error calculating detailed pricing:", error);
                throw error;
            }
        });
    }
}
exports.default = new RoomTypePricingController();
