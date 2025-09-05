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
const publicPropertyService_1 = __importDefault(require("../../service/property/publicPropertyService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const property_1 = require("../../constants/controllers/property");
const publicPropertyValidationHelper_1 = __importDefault(require("../../helpers/property/publicPropertyValidationHelper"));
const publicPropertyErrorHelper_1 = __importDefault(require("../../helpers/property/publicPropertyErrorHelper"));
class PublicPropertyController extends BaseController_1.default {
    // GET /api/public/properties - Public property search
    searchProperties(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validation = publicPropertyValidationHelper_1.default.validateSearchQuery(req.query);
                if (!validation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(validation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const result = yield publicPropertyService_1.default.searchProperties(validation.query);
                responseHelper_1.default.paginated(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED, result.properties, {
                    currentPage: result.pagination.page,
                    totalItems: result.pagination.total,
                    itemsPerPage: result.pagination.limit,
                    totalPages: result.pagination.totalPages,
                    hasNextPage: result.pagination.page < result.pagination.totalPages,
                    hasPrevPage: result.pagination.page > 1,
                });
            }
            catch (error) {
                logger_1.default.error("Error in searchProperties:", error);
                const errorResponse = publicPropertyErrorHelper_1.default.mapError(error, "search");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // GET /api/public/properties/:id - Get property details
    getPropertyDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idValidation = publicPropertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const property = yield publicPropertyService_1.default.getPropertyDetails(req.params.id);
                if (!property) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createNotFoundError();
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED, property);
            }
            catch (error) {
                logger_1.default.error("Error in getPropertyDetails:", error);
                const errorResponse = publicPropertyErrorHelper_1.default.mapError(error, "details");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // GET /api/public/properties/:id/calendar - Get property calendar pricing
    getPropertyCalendarPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idValidation = publicPropertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const calendarValidation = publicPropertyValidationHelper_1.default.validateCalendarQuery(req.query);
                if (!calendarValidation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(calendarValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const property = yield publicPropertyService_1.default.getCalendarPricing(req.params.id, 30 // Default 30 days
                );
                if (!property) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createNotFoundError();
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_CALENDAR_PRICING_RETRIEVED, property);
            }
            catch (error) {
                logger_1.default.error("Error in getPropertyCalendarPricing:", error);
                const errorResponse = publicPropertyErrorHelper_1.default.mapError(error, "calendar");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // GET /api/public/properties/:id/rooms - Get property rooms
    getPropertyRooms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idValidation = publicPropertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const roomValidation = publicPropertyValidationHelper_1.default.validateRoomQuery(req.query);
                if (!roomValidation.isValid) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createValidationError(roomValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const property = yield publicPropertyService_1.default.getPropertyRoomTypes(req.params.id);
                if (!property) {
                    const errorResponse = publicPropertyErrorHelper_1.default.createNotFoundError();
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_ROOMS_RETRIEVED, property);
            }
            catch (error) {
                logger_1.default.error("Error in getPropertyRooms:", error);
                const errorResponse = publicPropertyErrorHelper_1.default.mapError(error, "rooms");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
}
exports.default = new PublicPropertyController();
