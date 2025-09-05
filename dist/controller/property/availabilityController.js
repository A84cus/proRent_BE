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
const flexibleAvailabilityService_1 = __importDefault(require("../../service/property/flexibleAvailabilityService"));
const property_1 = require("../../constants/controllers/property");
const property_2 = require("../../helpers/property");
class AvailabilityController extends BaseController_1.default {
    /**
     * POST /api/rooms/:id/availability - Bulk set availability
     */
    setBulkAvailability(req, res) {
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
                const roomIdValidation = property_2.AvailabilityValidationHelper.validateRoomId(id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate availability array
                const { availability } = req.body;
                const availabilityValidation = property_2.AvailabilityValidationHelper.validateAvailabilityArray(availability);
                if (!availabilityValidation.isValid) {
                    responseHelper_1.default.error(res, availabilityValidation.error, undefined, 400);
                    return;
                }
                // Process bulk availability setting
                yield flexibleAvailabilityService_1.default.setBulkAvailability(id, availabilityValidation.data, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.ROOM_AVAILABILITY_UPDATED);
            }
            catch (error) {
                this.handleError(res, error, "setBulkAvailability", property_2.AvailabilityErrorHelper.getBulkAvailabilityErrorMappings());
            }
        });
    }
    /**
     * GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability
     */
    getMonthlyAvailability(req, res) {
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
                const roomIdValidation = property_2.AvailabilityValidationHelper.validateRoomId(id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate month parameter
                const { month } = req.query;
                const monthValidation = property_2.AvailabilityValidationHelper.validateMonthParameter(month);
                if (!monthValidation.isValid) {
                    responseHelper_1.default.error(res, monthValidation.error, undefined, 400);
                    return;
                }
                // Get monthly availability
                const availability = yield flexibleAvailabilityService_1.default.getMonthlyAvailability(id, monthValidation.year, monthValidation.month, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.MONTHLY_AVAILABILITY_RETRIEVED, availability);
            }
            catch (error) {
                this.handleError(res, error, "getMonthlyAvailability", property_2.AvailabilityErrorHelper.getMonthlyAvailabilityErrorMappings());
            }
        });
    }
}
exports.default = new AvailabilityController();
