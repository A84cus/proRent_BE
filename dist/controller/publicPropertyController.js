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
const publicPropertyService_1 = __importDefault(require("../service/publicPropertyService"));
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
                    sortBy: sortBy ? String(sortBy) : "createdAt",
                    sortOrder: sortOrder ? String(sortOrder) : "desc",
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 10,
                };
                // Validation
                if (searchQuery.minPrice !== undefined && searchQuery.minPrice < 0) {
                    responseHelper_1.default.error(res, "Minimum price cannot be negative", undefined, 400);
                    return;
                }
                if (searchQuery.maxPrice !== undefined && searchQuery.maxPrice < 0) {
                    responseHelper_1.default.error(res, "Maximum price cannot be negative", undefined, 400);
                    return;
                }
                if (searchQuery.minPrice !== undefined &&
                    searchQuery.maxPrice !== undefined &&
                    searchQuery.minPrice > searchQuery.maxPrice) {
                    responseHelper_1.default.error(res, "Minimum price cannot be greater than maximum price", undefined, 400);
                    return;
                }
                if (searchQuery.minRooms !== undefined && searchQuery.minRooms < 1) {
                    responseHelper_1.default.error(res, "Minimum rooms must be at least 1", undefined, 400);
                    return;
                }
                if (searchQuery.maxRooms !== undefined && searchQuery.maxRooms < 1) {
                    responseHelper_1.default.error(res, "Maximum rooms must be at least 1", undefined, 400);
                    return;
                }
                if (searchQuery.minRooms !== undefined &&
                    searchQuery.maxRooms !== undefined &&
                    searchQuery.minRooms > searchQuery.maxRooms) {
                    responseHelper_1.default.error(res, "Minimum rooms cannot be greater than maximum rooms", undefined, 400);
                    return;
                }
                if (!["createdAt", "name", "pricing"].includes(searchQuery.sortBy)) {
                    responseHelper_1.default.error(res, "Sort by must be one of: createdAt, name, pricing", undefined, 400);
                    return;
                }
                if (!["asc", "desc"].includes(searchQuery.sortOrder)) {
                    responseHelper_1.default.error(res, "Sort order must be either 'asc' or 'desc'", undefined, 400);
                    return;
                }
                if (searchQuery.page < 1) {
                    responseHelper_1.default.error(res, "Page must be at least 1", undefined, 400);
                    return;
                }
                if (searchQuery.limit < 1 || searchQuery.limit > 100) {
                    responseHelper_1.default.error(res, "Limit must be between 1 and 100", undefined, 400);
                    return;
                }
                const result = yield publicPropertyService_1.default.searchProperties(searchQuery);
                responseHelper_1.default.success(res, "Properties retrieved successfully", result);
            }
            catch (error) {
                this.handleError(res, error, "searchProperties", {
                    "Failed to search properties": {
                        message: "Failed to search properties",
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
                    responseHelper_1.default.error(res, "Property ID is required", undefined, 400);
                    return;
                }
                const property = yield publicPropertyService_1.default.getPropertyDetails(id);
                responseHelper_1.default.success(res, "Property details retrieved successfully", property);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyDetails", {
                    "Property not found": {
                        message: "Property not found",
                        statusCode: 404,
                    },
                    "Failed to get property details": {
                        message: "Failed to get property details",
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
                    responseHelper_1.default.error(res, "Property ID is required", undefined, 400);
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
                    responseHelper_1.default.error(res, "Invalid date format. Use YYYY-MM-DD format", undefined, 400);
                    return;
                }
                const start = new Date(defaultStartDate);
                const end = new Date(defaultEndDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    responseHelper_1.default.error(res, "Invalid date values", undefined, 400);
                    return;
                }
                if (start > end) {
                    responseHelper_1.default.error(res, "Start date must be before or equal to end date", undefined, 400);
                    return;
                }
                // Limit to maximum 3 months range
                const maxDateDiff = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
                if (end.getTime() - start.getTime() > maxDateDiff) {
                    responseHelper_1.default.error(res, "Date range cannot exceed 90 days", undefined, 400);
                    return;
                }
                // Calculate days between start and end date
                const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
                    1;
                const calendar = yield publicPropertyService_1.default.getCalendarPricing(id, daysDiff);
                responseHelper_1.default.success(res, "Property calendar pricing retrieved successfully", calendar);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyCalendarPricing", {
                    "Property not found": {
                        message: "Property not found",
                        statusCode: 404,
                    },
                    "Failed to get calendar pricing": {
                        message: "Failed to get calendar pricing",
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
                    responseHelper_1.default.error(res, "Property ID is required", undefined, 400);
                    return;
                }
                const includeUnavailableRooms = includeUnavailable === "true";
                const rooms = yield publicPropertyService_1.default.getPropertyRoomTypes(id);
                responseHelper_1.default.success(res, "Property rooms retrieved successfully", rooms);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyRooms", {
                    "Property not found": {
                        message: "Property not found",
                        statusCode: 404,
                    },
                    "Failed to get property rooms": {
                        message: "Failed to get property rooms",
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new PublicPropertyController();
