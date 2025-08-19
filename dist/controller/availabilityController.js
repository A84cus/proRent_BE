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
const BaseController_1 = __importDefault(require("./BaseController"));
const responseHelper_1 = __importDefault(require("../helpers/responseHelper"));
const availabilityService_1 = __importDefault(require("../service/availabilityService"));
class AvailabilityController extends BaseController_1.default {
    // POST /api/rooms/:id/availability - Bulk set availability
    setBulkAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "User validation failed", undefined, 401);
                    return;
                }
                const { id } = req.params;
                const { availability } = req.body;
                if (!id) {
                    responseHelper_1.default.error(res, "Room ID is required", undefined, 400);
                    return;
                }
                if (!availability || !Array.isArray(availability)) {
                    responseHelper_1.default.error(res, "Availability array is required", undefined, 400);
                    return;
                }
                if (availability.length === 0) {
                    responseHelper_1.default.error(res, "Availability array cannot be empty", undefined, 400);
                    return;
                }
                // Validate each availability item
                for (let i = 0; i < availability.length; i++) {
                    const item = availability[i];
                    if (!item || typeof item !== "object") {
                        responseHelper_1.default.error(res, `Availability item at index ${i} must be an object`, undefined, 400);
                        return;
                    }
                    if (!item.date || typeof item.date !== "string") {
                        responseHelper_1.default.error(res, `Date is required at index ${i} and must be a string (YYYY-MM-DD)`, undefined, 400);
                        return;
                    }
                    if (typeof item.isAvailable !== "boolean") {
                        responseHelper_1.default.error(res, `isAvailable is required at index ${i} and must be a boolean`, undefined, 400);
                        return;
                    }
                    // Validate date format
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(item.date)) {
                        responseHelper_1.default.error(res, `Invalid date format at index ${i}. Use YYYY-MM-DD format`, undefined, 400);
                        return;
                    }
                }
                yield availabilityService_1.default.setBulkAvailability(id, availability, userValidation.userId);
                responseHelper_1.default.success(res, "Room availability updated successfully");
            }
            catch (error) {
                this.handleError(res, error, "setBulkAvailability", {
                    "Room not found": { message: "Room not found", statusCode: 404 },
                    "You don't have permission to manage this room's availability": {
                        message: "You don't have permission to manage this room's availability",
                        statusCode: 403,
                    },
                    "Cannot set unavailable dates that have active reservations": {
                        message: "Cannot set unavailable dates that have active reservations",
                        statusCode: 409,
                    },
                    "Failed to set room availability": {
                        message: "Failed to set room availability",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability
    getMonthlyAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "User validation failed", undefined, 401);
                    return;
                }
                const { id } = req.params;
                const { month } = req.query;
                if (!id) {
                    responseHelper_1.default.error(res, "Room ID is required", undefined, 400);
                    return;
                }
                if (!month || typeof month !== "string") {
                    responseHelper_1.default.error(res, "Month parameter is required in YYYY-MM format", undefined, 400);
                    return;
                }
                // Validate month format
                const monthRegex = /^\d{4}-\d{2}$/;
                if (!monthRegex.test(month)) {
                    responseHelper_1.default.error(res, "Invalid month format. Use YYYY-MM format", undefined, 400);
                    return;
                }
                // Parse year and month
                const [yearStr, monthStr] = month.split("-");
                const year = parseInt(yearStr, 10);
                const monthNum = parseInt(monthStr, 10);
                // Validate year and month ranges
                if (year < 2000 || year > 2100) {
                    responseHelper_1.default.error(res, "Year must be between 2000 and 2100", undefined, 400);
                    return;
                }
                if (monthNum < 1 || monthNum > 12) {
                    responseHelper_1.default.error(res, "Month must be between 01 and 12", undefined, 400);
                    return;
                }
                const availability = yield availabilityService_1.default.getMonthlyAvailability(id, year, monthNum, userValidation.userId);
                responseHelper_1.default.success(res, "Monthly availability retrieved successfully", availability);
            }
            catch (error) {
                this.handleError(res, error, "getMonthlyAvailability", {
                    "Room not found": { message: "Room not found", statusCode: 404 },
                    "You don't have permission to view this room's availability": {
                        message: "You don't have permission to view this room's availability",
                        statusCode: 403,
                    },
                    "Failed to get room availability": {
                        message: "Failed to get room availability",
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new AvailabilityController();
