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
const publicPropertyRepository_1 = __importDefault(require("../../repository/property/publicPropertyRepository"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
class PublicPropertyService {
    // Search properties with filters and pagination
    searchProperties(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Validate and sanitize parameters
                const page = Math.max(1, params.page || 1);
                const limit = Math.min(50, Math.max(1, params.limit || 10)); // Max 50 per page
                const searchParams = {
                    search: (_a = params.search) === null || _a === void 0 ? void 0 : _a.trim(),
                    categoryId: (_b = params.category) === null || _b === void 0 ? void 0 : _b.trim(),
                    sort: params.sort,
                    page,
                    limit,
                };
                const result = yield publicPropertyRepository_1.default.searchProperties(searchParams);
                // Transform the data for public consumption
                const transformedProperties = result.properties.map((property) => {
                    // Type assertion since repository returns expanded data
                    const expandedProperty = property;
                    return {
                        id: expandedProperty.id,
                        name: expandedProperty.name,
                        description: expandedProperty.description,
                        category: expandedProperty.category,
                        location: {
                            address: expandedProperty.location.address,
                            city: expandedProperty.location.city.name,
                            province: expandedProperty.location.city.province.name,
                        },
                        mainPicture: expandedProperty.mainPicture,
                        priceRange: {
                            min: expandedProperty.roomTypes.length > 0
                                ? Math.min(...expandedProperty.roomTypes.map((rt) => Number(rt.basePrice)))
                                : 0,
                            max: expandedProperty.roomTypes.length > 0
                                ? Math.max(...expandedProperty.roomTypes.map((rt) => Number(rt.basePrice)))
                                : 0,
                        },
                        roomCount: expandedProperty._count.rooms,
                        capacity: expandedProperty.roomTypes.length > 0
                            ? Math.max(...expandedProperty.roomTypes.map((rt) => rt.capacity))
                            : 0,
                        createdAt: expandedProperty.createdAt,
                    };
                });
                return {
                    properties: transformedProperties,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                };
            }
            catch (error) {
                logger_1.default.error("Error searching properties:", error);
                throw new Error("Failed to search properties");
            }
        });
    }
    // Get property details for public view
    getPropertyDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const property = (yield publicPropertyRepository_1.default.findByIdPublic(id));
                if (!property) {
                    return null;
                }
                // Transform for public consumption
                return {
                    id: property.id,
                    name: property.name,
                    description: property.description,
                    category: property.category,
                    location: {
                        address: property.location.address,
                        city: property.location.city.name,
                        province: property.location.city.province.name,
                        coordinates: property.location.latitude && property.location.longitude
                            ? {
                                latitude: Number(property.location.latitude),
                                longitude: Number(property.location.longitude),
                            }
                            : null,
                    },
                    owner: {
                        name: property.Owner.profile
                            ? `${property.Owner.profile.firstName || ""} ${property.Owner.profile.lastName || ""}`.trim()
                            : "Property Owner",
                        phone: ((_a = property.Owner.profile) === null || _a === void 0 ? void 0 : _a.phone) || null,
                    },
                    pictures: {
                        main: property.mainPicture,
                        gallery: property.gallery.map((g) => g.picture),
                    },
                    rooms: property.rooms.map((room) => ({
                        id: room.id,
                        name: room.name,
                        roomType: room.roomType,
                        isAvailable: room.isAvailable,
                        pictures: room.gallery.map((g) => g.picture),
                    })),
                    roomTypes: property.roomTypes.map((roomType) => ({
                        id: roomType.id,
                        name: roomType.name,
                        description: roomType.description,
                        basePrice: Number(roomType.basePrice),
                        capacity: roomType.capacity,
                        totalQuantity: roomType.totalQuantity,
                        upcomingPeakRates: roomType.peakRates.map((rate) => ({
                            name: rate.name,
                            startDate: rate.startDate,
                            endDate: rate.endDate,
                            rateType: rate.rateType,
                            value: Number(rate.value),
                        })),
                    })),
                    createdAt: property.createdAt,
                    updatedAt: property.updatedAt,
                };
            }
            catch (error) {
                logger_1.default.error("Error getting property details:", error);
                throw new Error("Failed to get property details");
            }
        });
    }
    // Get room types for a property
    getPropertyRoomTypes(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomTypes = yield publicPropertyRepository_1.default.findRoomTypesByProperty(propertyId);
                return roomTypes.map((roomType) => ({
                    id: roomType.id,
                    name: roomType.name,
                    description: roomType.description,
                    basePrice: Number(roomType.basePrice),
                    capacity: roomType.capacity,
                    totalQuantity: roomType.totalQuantity,
                    availableRooms: roomType._count.rooms,
                    rooms: roomType.rooms.map((room) => ({
                        id: room.id,
                        name: room.name,
                        isAvailable: room.isAvailable,
                    })),
                    upcomingPeakRates: roomType.peakRates.map((rate) => ({
                        name: rate.name || "",
                        startDate: rate.startDate,
                        endDate: rate.endDate,
                        rateType: rate.rateType,
                        value: Number(rate.value),
                        description: rate.description,
                    })),
                }));
            }
            catch (error) {
                logger_1.default.error("Error getting property room types:", error);
                throw new Error("Failed to get property room types");
            }
        });
    }
    // Get calendar pricing for property
    getCalendarPricing(propertyId_1) {
        return __awaiter(this, arguments, void 0, function* (propertyId, days = 30) {
            var _a, _b;
            try {
                // Validate days parameter
                const validDays = Math.min(365, Math.max(1, days)); // Max 1 year, min 1 day
                // Check if property exists
                const property = yield publicPropertyRepository_1.default.findByIdPublic(propertyId);
                if (!property) {
                    throw new Error("Property not found");
                }
                const dailyData = yield publicPropertyRepository_1.default.getDailyPricingAndAvailability(propertyId, validDays);
                return {
                    propertyId,
                    propertyName: property.name,
                    period: {
                        startDate: (_a = dailyData[0]) === null || _a === void 0 ? void 0 : _a.date,
                        endDate: (_b = dailyData[dailyData.length - 1]) === null || _b === void 0 ? void 0 : _b.date,
                        totalDays: validDays,
                    },
                    dailyPricing: dailyData,
                };
            }
            catch (error) {
                logger_1.default.error("Error getting calendar pricing:", error);
                if (error instanceof Error && error.message === "Property not found") {
                    throw error;
                }
                throw new Error("Failed to get calendar pricing");
            }
        });
    }
    // Get all categories for filtering
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield publicPropertyRepository_1.default.findAllCategories();
            }
            catch (error) {
                logger_1.default.error("Error getting categories:", error);
                throw new Error("Failed to get categories");
            }
        });
    }
    // Get room type by ID (public access)
    getRoomTypeById(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomType = yield publicPropertyRepository_1.default.findRoomTypeById(roomTypeId);
                if (!roomType) {
                    throw new Error("Room type not found");
                }
                return roomType;
            }
            catch (error) {
                logger_1.default.error(`Error getting room type with ID ${roomTypeId}:`, error);
                throw new Error("Failed to get room type");
            }
        });
    }
}
exports.default = new PublicPropertyService();
