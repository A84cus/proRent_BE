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
const property_1 = require("../../constants/controllers/property");
const property_2 = require("../../helpers/property");
class PeakRateController extends BaseController_1.default {
    /**
     * POST /api/rooms/:id/peak-price - Add peak rate rule
     */
    addPeakRate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user authentication
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                // Validate room ID
                const { id } = req.params;
                const roomIdValidation = property_2.PeakRateValidationHelper.validateRoomId(id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate peak rate data
                const dataValidation = property_2.PeakRateValidationHelper.validateCreatePeakRateData(req.body);
                if (!dataValidation.isValid) {
                    responseHelper_1.default.error(res, dataValidation.error, undefined, 400);
                    return;
                }
                // Add peak rate
                const newPeakRate = yield peakRateService_1.default.addPeakRate(id, dataValidation.data, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_ADDED, newPeakRate, 201);
            }
            catch (error) {
                this.handleError(res, error, "addPeakRate", property_2.PeakRateErrorHelper.getAddPeakRateErrorMappings());
            }
        });
    }
    /**
     * PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
     */
    updatePeakRateForDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user authentication
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                // Validate room ID
                const { id, date } = req.params;
                const roomIdValidation = property_2.PeakRateValidationHelper.validateRoomId(id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate date parameter
                const dateValidation = property_2.PeakRateValidationHelper.validateDate(date);
                if (!dateValidation.isValid) {
                    responseHelper_1.default.error(res, dateValidation.error, undefined, 400);
                    return;
                }
                // Validate update data
                const dataValidation = property_2.PeakRateValidationHelper.validateUpdatePeakRateData(req.body);
                if (!dataValidation.isValid) {
                    responseHelper_1.default.error(res, dataValidation.error, undefined, 400);
                    return;
                }
                // Update peak rate
                const updatedPeakRate = yield peakRateService_1.default.updatePeakRateForDate(id, date, dataValidation.data, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_UPDATED, updatedPeakRate);
            }
            catch (error) {
                this.handleError(res, error, "updatePeakRateForDate", property_2.PeakRateErrorHelper.getUpdatePeakRateErrorMappings());
            }
        });
    }
    /**
     * DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
     */
    removePeakRateForDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user authentication
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                // Validate room ID
                const { id, date } = req.params;
                const roomIdValidation = property_2.PeakRateValidationHelper.validateRoomId(id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate date parameter
                const dateValidation = property_2.PeakRateValidationHelper.validateDate(date);
                if (!dateValidation.isValid) {
                    responseHelper_1.default.error(res, dateValidation.error, undefined, 400);
                    return;
                }
                // Remove peak rate
                yield peakRateService_1.default.removePeakRateForDate(id, date, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_REMOVED);
            }
            catch (error) {
                this.handleError(res, error, "removePeakRateForDate", property_2.PeakRateErrorHelper.getRemovePeakRateErrorMappings());
            }
        });
    }
}
exports.default = new PeakRateController();
