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
const peakRateService_1 = __importDefault(require("../service/peakRateService"));
const client_1 = require("@prisma/client");
class PeakRateController extends BaseController_1.default {
    // POST /api/rooms/:id/peak-price - Add peak rate rule
    addPeakRate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "User validation failed", undefined, 401);
                    return;
                }
                const { id } = req.params;
                const { startDate, endDate, rateType, value, description } = req.body;
                if (!id) {
                    responseHelper_1.default.error(res, "Room ID is required", undefined, 400);
                    return;
                }
                // Validation
                if (!startDate || typeof startDate !== "string") {
                    responseHelper_1.default.error(res, "Start date is required (YYYY-MM-DD format)", undefined, 400);
                    return;
                }
                if (!endDate || typeof endDate !== "string") {
                    responseHelper_1.default.error(res, "End date is required (YYYY-MM-DD format)", undefined, 400);
                    return;
                }
                if (!rateType || !Object.values(client_1.RateType).includes(rateType)) {
                    responseHelper_1.default.error(res, "Rate type is required and must be either FIXED or PERCENTAGE", undefined, 400);
                    return;
                }
                if (!value || typeof value !== "number") {
                    responseHelper_1.default.error(res, "Value is required and must be a number", undefined, 400);
                    return;
                }
                if (description !== undefined && typeof description !== "string") {
                    responseHelper_1.default.error(res, "Description must be a string", undefined, 400);
                    return;
                }
                const peakRateData = {
                    startDate: startDate.trim(),
                    endDate: endDate.trim(),
                    rateType: rateType,
                    value: Number(value),
                    description: description === null || description === void 0 ? void 0 : description.trim(),
                };
                const newPeakRate = yield peakRateService_1.default.addPeakRate(id, peakRateData, userValidation.userId);
                responseHelper_1.default.success(res, "Peak rate added successfully", newPeakRate, 201);
            }
            catch (error) {
                this.handleError(res, error, "addPeakRate", {
                    "Room not found": { message: "Room not found", statusCode: 404 },
                    "You don't have permission to manage this room's pricing": {
                        message: "You don't have permission to manage this room's pricing",
                        statusCode: 403,
                    },
                    "Invalid date format. Use YYYY-MM-DD format": {
                        message: "Invalid date format. Use YYYY-MM-DD format",
                        statusCode: 400,
                    },
                    "Start date must be before end date": {
                        message: "Start date must be before end date",
                        statusCode: 400,
                    },
                    "Start date cannot be in the past": {
                        message: "Start date cannot be in the past",
                        statusCode: 400,
                    },
                    "Rate value must be greater than 0": {
                        message: "Rate value must be greater than 0",
                        statusCode: 400,
                    },
                    "Percentage rate cannot exceed 1000%": {
                        message: "Percentage rate cannot exceed 1000%",
                        statusCode: 400,
                    },
                    "Peak rate overlaps with existing rate rules": {
                        message: "Peak rate overlaps with existing rate rules",
                        statusCode: 409,
                    },
                    "Failed to add peak rate": {
                        message: "Failed to add peak rate",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
    updatePeakRateForDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "User validation failed", undefined, 401);
                    return;
                }
                const { id, date } = req.params;
                const { startDate, endDate, rateType, value, description } = req.body;
                if (!id) {
                    responseHelper_1.default.error(res, "Room ID is required", undefined, 400);
                    return;
                }
                if (!date) {
                    responseHelper_1.default.error(res, "Date is required", undefined, 400);
                    return;
                }
                // Check if at least one field is provided
                if (startDate === undefined &&
                    endDate === undefined &&
                    rateType === undefined &&
                    value === undefined &&
                    description === undefined) {
                    responseHelper_1.default.error(res, "At least one field is required for update", undefined, 400);
                    return;
                }
                // Validation for provided fields
                if (startDate !== undefined && typeof startDate !== "string") {
                    responseHelper_1.default.error(res, "Start date must be a string (YYYY-MM-DD format)", undefined, 400);
                    return;
                }
                if (endDate !== undefined && typeof endDate !== "string") {
                    responseHelper_1.default.error(res, "End date must be a string (YYYY-MM-DD format)", undefined, 400);
                    return;
                }
                if (rateType !== undefined &&
                    !Object.values(client_1.RateType).includes(rateType)) {
                    responseHelper_1.default.error(res, "Rate type must be either FIXED or PERCENTAGE", undefined, 400);
                    return;
                }
                if (value !== undefined && typeof value !== "number") {
                    responseHelper_1.default.error(res, "Value must be a number", undefined, 400);
                    return;
                }
                if (description !== undefined && typeof description !== "string") {
                    responseHelper_1.default.error(res, "Description must be a string", undefined, 400);
                    return;
                }
                const updateData = {};
                if (startDate !== undefined)
                    updateData.startDate = startDate.trim();
                if (endDate !== undefined)
                    updateData.endDate = endDate.trim();
                if (rateType !== undefined)
                    updateData.rateType = rateType;
                if (value !== undefined)
                    updateData.value = Number(value);
                if (description !== undefined)
                    updateData.description = description.trim();
                const updatedPeakRate = yield peakRateService_1.default.updatePeakRateForDate(id, date, updateData, userValidation.userId);
                responseHelper_1.default.success(res, "Peak rate updated successfully", updatedPeakRate);
            }
            catch (error) {
                this.handleError(res, error, "updatePeakRateForDate", {
                    "Room not found": { message: "Room not found", statusCode: 404 },
                    "You don't have permission to manage this room's pricing": {
                        message: "You don't have permission to manage this room's pricing",
                        statusCode: 403,
                    },
                    "No peak rate found for the specified date": {
                        message: "No peak rate found for the specified date",
                        statusCode: 404,
                    },
                    "Invalid date format. Use YYYY-MM-DD format": {
                        message: "Invalid date format. Use YYYY-MM-DD format",
                        statusCode: 400,
                    },
                    "Invalid start date format. Use YYYY-MM-DD format": {
                        message: "Invalid start date format. Use YYYY-MM-DD format",
                        statusCode: 400,
                    },
                    "Invalid end date format. Use YYYY-MM-DD format": {
                        message: "Invalid end date format. Use YYYY-MM-DD format",
                        statusCode: 400,
                    },
                    "Start date must be before end date": {
                        message: "Start date must be before end date",
                        statusCode: 400,
                    },
                    "Rate value must be greater than 0": {
                        message: "Rate value must be greater than 0",
                        statusCode: 400,
                    },
                    "Percentage rate cannot exceed 1000%": {
                        message: "Percentage rate cannot exceed 1000%",
                        statusCode: 400,
                    },
                    "Updated date range would overlap with existing rate rules": {
                        message: "Updated date range would overlap with existing rate rules",
                        statusCode: 409,
                    },
                    "Failed to update peak rate": {
                        message: "Failed to update peak rate",
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
    removePeakRateForDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error || "User validation failed", undefined, 401);
                    return;
                }
                const { id, date } = req.params;
                if (!id) {
                    responseHelper_1.default.error(res, "Room ID is required", undefined, 400);
                    return;
                }
                if (!date) {
                    responseHelper_1.default.error(res, "Date is required", undefined, 400);
                    return;
                }
                yield peakRateService_1.default.removePeakRateForDate(id, date, userValidation.userId);
                responseHelper_1.default.success(res, "Peak rate removed successfully. Room will revert to base price for this period.");
            }
            catch (error) {
                this.handleError(res, error, "removePeakRateForDate", {
                    "Room not found": { message: "Room not found", statusCode: 404 },
                    "You don't have permission to manage this room's pricing": {
                        message: "You don't have permission to manage this room's pricing",
                        statusCode: 403,
                    },
                    "No peak rate found for the specified date": {
                        message: "No peak rate found for the specified date",
                        statusCode: 404,
                    },
                    "Invalid date format. Use YYYY-MM-DD format": {
                        message: "Invalid date format. Use YYYY-MM-DD format",
                        statusCode: 400,
                    },
                    "Failed to remove peak rate": {
                        message: "Failed to remove peak rate",
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new PeakRateController();
