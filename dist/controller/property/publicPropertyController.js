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
const property_1 = require("../../constants/controllers/property");
class PublicPropertyController extends BaseController_1.default {
    // GET /api/public/properties - Public property search
    searchProperties(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search, category, province, city, location, minPrice, maxPrice, minRooms, maxRooms, sortBy, sortOrder, page, limit, } = req.query;
                // Parse query parameters
                const searchQuery = {
                    search: search ? String(search).trim() : undefined,
                    category: category ? String(category).trim() : undefined,
                    province: province ? String(province).trim() : undefined,
                    city: city ? String(city).trim() : undefined,
                    location: location ? String(location).trim() : undefined,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                    minRooms: minRooms ? Number(minRooms) : undefined,
                    maxRooms: maxRooms ? Number(maxRooms) : undefined,
                    sortBy: sortBy
                        ? String(sortBy)
                        : "createdAt",
                    sortOrder: sortOrder ? String(sortOrder) : "desc",
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 10,
                };
                // Validation
                if (searchQuery.minPrice !== undefined && searchQuery.minPrice < 0) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MIN_PRICE, undefined, 400);
                    return;
                }
                if (searchQuery.maxPrice !== undefined && searchQuery.maxPrice < 0) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MAX_PRICE, undefined, 400);
                    return;
                }
                if (searchQuery.minPrice !== undefined &&
                    searchQuery.maxPrice !== undefined &&
                    searchQuery.minPrice > searchQuery.maxPrice) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_PRICE_GREATER_THAN_MAX, undefined, 400);
                    return;
                }
                if (searchQuery.minRooms !== undefined && searchQuery.minRooms < 1) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_TOO_LOW, undefined, 400);
                    return;
                }
                if (searchQuery.maxRooms !== undefined && searchQuery.maxRooms < 1) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MAX_ROOMS_TOO_LOW, undefined, 400);
                    return;
                }
                if (searchQuery.minRooms !== undefined &&
                    searchQuery.maxRooms !== undefined &&
                    searchQuery.minRooms > searchQuery.maxRooms) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_ROOMS_GREATER_THAN_MAX, undefined, 400);
                    return;
                }
                if (!["createdAt", "name", "pricing"].includes(searchQuery.sortBy)) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_BY, undefined, 400);
                    return;
                }
                if (!["asc", "desc"].includes(searchQuery.sortOrder)) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_ORDER_VALUE, undefined, 400);
                    return;
                }
                if (searchQuery.page < 1) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PAGE_MUST_BE_AT_LEAST_ONE, undefined, 400);
                    return;
                }
                if (searchQuery.limit < 1 || searchQuery.limit > 100) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_LIMIT_RANGE, undefined, 400);
                    return;
                }
                const result = yield publicPropertyService_1.default.searchProperties(searchQuery);
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED, result);
            }
            catch (error) {
                this.handleError(res, error, "searchProperties", {
                    "Failed to search properties": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.SEARCH_FAILED,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // GET /api/public/properties/:id - Get property details
    getPropertyDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                const property = yield publicPropertyService_1.default.getPropertyDetails(id);
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED, property);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyDetails", {
                    "Property not found": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
                        statusCode: 404,
                    },
                    "Failed to get property details": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_DETAILS,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // GET /api/public/properties/:id/calendar-pricing - Get calendar with pricing
    getPropertyCalendarPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { startDate, endDate } = req.query;
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                // Default to current month if no dates provided
                const now = new Date();
                const defaultStartDate = startDate
                    ? String(startDate)
                    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
                const defaultEndDate = endDate
                    ? String(endDate)
                    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(defaultStartDate) ||
                    !dateRegex.test(defaultEndDate)) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT, undefined, 400);
                    return;
                }
                const start = new Date(defaultStartDate);
                const end = new Date(defaultEndDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_VALUES, undefined, 400);
                    return;
                }
                if (start > end) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE, undefined, 400);
                    return;
                }
                // Limit to maximum 3 months range
                const maxDateDiff = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
                if (end.getTime() - start.getTime() > maxDateDiff) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.DATE_RANGE_LIMIT, undefined, 400);
                    return;
                }
                // Calculate days between start and end date
                const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
                    1;
                const calendar = yield publicPropertyService_1.default.getCalendarPricing(id, daysDiff);
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_CALENDAR_PRICING_RETRIEVED, calendar);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyCalendarPricing", {
                    "Property not found": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
                        statusCode: 404,
                    },
                    "Failed to get calendar pricing": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_CALENDAR_PRICING,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // GET /api/public/properties/:id/rooms - Get property rooms
    getPropertyRooms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { includeUnavailable } = req.query;
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                const includeUnavailableRooms = includeUnavailable === "true";
                const rooms = yield publicPropertyService_1.default.getPropertyRoomTypes(id);
                responseHelper_1.default.success(res, property_1.PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_ROOMS_RETRIEVED, rooms);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyRooms", {
                    "Property not found": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND,
                        statusCode: 404,
                    },
                    "Failed to get property rooms": {
                        message: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.FAILED_TO_GET_PROPERTY_ROOMS,
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new PublicPropertyController();
