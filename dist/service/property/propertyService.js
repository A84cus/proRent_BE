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
const propertyRepository_1 = __importDefault(require("../../repository/property/propertyRepository"));
const categoryRepository_1 = __importDefault(require("../../repository/property/categoryRepository"));
const publicPropertyService_1 = __importDefault(require("./publicPropertyService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const propertyServiceErrors_1 = require("../../constants/services/propertyServiceErrors");
const propertyValidation_1 = require("../../validations/property/propertyValidation");
class PropertyService {
    // Get all properties owned by owner with filtering and pagination
    getAllPropertiesByOwner(ownerId, searchParams) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // If search params provided, use filtered search with pagination
                if (searchParams) {
                    return yield publicPropertyService_1.default.getOwnerProperties(Object.assign(Object.assign({}, searchParams), { ownerId }));
                }
                // Otherwise, get all properties (backward compatibility)
                const properties = yield propertyRepository_1.default.findAllByOwner(ownerId);
                // Transform to match the expected format
                const transformedProperties = properties.map((property) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    return ({
                        id: property.id,
                        name: property.name,
                        description: property.description,
                        rentalType: property.rentalType,
                        category: property.category,
                        location: {
                            address: ((_a = property.location) === null || _a === void 0 ? void 0 : _a.address) || null,
                            city: ((_c = (_b = property.location) === null || _b === void 0 ? void 0 : _b.city) === null || _c === void 0 ? void 0 : _c.name) || "",
                            province: ((_f = (_e = (_d = property.location) === null || _d === void 0 ? void 0 : _d.city) === null || _e === void 0 ? void 0 : _e.province) === null || _f === void 0 ? void 0 : _f.name) || "",
                        },
                        mainPicture: property.mainPicture,
                        priceRange: {
                            min: ((_g = property.roomTypes) === null || _g === void 0 ? void 0 : _g.length) > 0
                                ? Math.min(...property.roomTypes.map((rt) => Number(rt.basePrice)))
                                : 0,
                            max: ((_h = property.roomTypes) === null || _h === void 0 ? void 0 : _h.length) > 0
                                ? Math.max(...property.roomTypes.map((rt) => Number(rt.basePrice)))
                                : 0,
                        },
                        roomCount: ((_j = property._count) === null || _j === void 0 ? void 0 : _j.rooms) || 0,
                        capacity: ((_k = property.roomTypes) === null || _k === void 0 ? void 0 : _k.length) > 0
                            ? Math.max(...property.roomTypes.map((rt) => rt.capacity))
                            : 0,
                        rooms: property.rooms || [],
                        roomTypes: property.roomTypes || [],
                        createdAt: property.createdAt,
                    });
                });
                return { properties: transformedProperties };
            }
            catch (error) {
                logger_1.default.error("Error fetching owner properties:", error);
                throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.FAILED_TO_FETCH_PROPERTIES);
            }
        });
    }
    // Get property by ID with authorization check
    getPropertyById(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ownerId) {
                    // If ownerId provided, check ownership
                    return yield propertyRepository_1.default.findByIdAndOwner(id, ownerId);
                }
                else {
                    // For public view
                    return yield propertyRepository_1.default.findById(id);
                }
            }
            catch (error) {
                logger_1.default.error(`Error fetching property with ID ${id}:`, error);
                throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.FAILED_TO_FETCH_PROPERTY);
            }
        });
    }
    // Create new property
    createProperty(data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input data using schema
                const validationResult = propertyValidation_1.propertyCreateSchema.safeParse(data);
                if (!validationResult.success) {
                    throw new Error(validationResult.error.issues[0].message);
                }
                // Validate location fields using centralized validation
                const locationValidation = (0, propertyValidation_1.validatePropertyLocation)(data.location, data.city, data.province);
                if (!locationValidation.isValid) {
                    throw new Error(locationValidation.errors.join(", "));
                }
                // Validate category exists
                const category = yield categoryRepository_1.default.findById(data.categoryId);
                if (!category) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND);
                }
                // Validate rental type
                if (!["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(data.rentalType)) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE);
                }
                // Handle location creation (province -> city -> location)
                const provinceId = yield propertyRepository_1.default.findOrCreateProvince(data.province);
                const cityId = yield propertyRepository_1.default.createCityIfNotExists(data.city, provinceId);
                const locationId = yield propertyRepository_1.default.getOrCreateLocation(data.location, cityId, data.latitude, data.longitude);
                const propertyData = {
                    name: data.name,
                    description: data.description,
                    rentalType: data.rentalType, // Handle rental type
                    category: {
                        connect: { id: data.categoryId },
                    },
                    location: {
                        connect: { id: locationId },
                    },
                    Owner: {
                        connect: { id: ownerId },
                    },
                    mainPicture: {
                        connect: { id: data.mainPictureId },
                    },
                };
                return yield propertyRepository_1.default.create(propertyData);
            }
            catch (error) {
                logger_1.default.error("Error creating property:", error);
                if (error instanceof Error) {
                    if (error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND ||
                        error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE) {
                        throw error;
                    }
                }
                throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.FAILED_TO_CREATE_PROPERTY);
            }
        });
    }
    // Update property
    updateProperty(id, data, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if property exists and belongs to owner
                const existingProperty = yield propertyRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingProperty) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_UPDATE);
                }
                // Validate category if provided
                if (data.categoryId) {
                    const category = yield categoryRepository_1.default.findById(data.categoryId);
                    if (!category) {
                        throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND);
                    }
                }
                // Validate rental type if provided
                if (data.rentalType &&
                    !["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(data.rentalType)) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE);
                }
                // Prepare update data
                const updateData = {};
                if (data.name)
                    updateData.name = data.name;
                if (data.description)
                    updateData.description = data.description;
                if (data.rentalType)
                    updateData.rentalType = data.rentalType; // Handle rental type update
                if (data.categoryId) {
                    updateData.category = { connect: { id: data.categoryId } };
                }
                if (data.mainPictureId) {
                    updateData.mainPicture = { connect: { id: data.mainPictureId } };
                }
                // Handle location update if provided
                if (data.location || data.city || data.province) {
                    // For location updates, we'll create new location entry
                    // Get default values if not provided
                    const province = data.province || "Unknown Province";
                    const city = data.city || "Unknown City";
                    const address = data.location || "Unknown Address";
                    const provinceId = yield propertyRepository_1.default.findOrCreateProvince(province);
                    const cityId = yield propertyRepository_1.default.createCityIfNotExists(city, provinceId);
                    const locationId = yield propertyRepository_1.default.getOrCreateLocation(address, cityId);
                    updateData.location = { connect: { id: locationId } };
                }
                return yield propertyRepository_1.default.update(id, updateData);
            }
            catch (error) {
                logger_1.default.error(`Error updating property with ID ${id}:`, error);
                if (error instanceof Error &&
                    (error.message ===
                        propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
                        error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND ||
                        error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE)) {
                    throw error;
                }
                throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.FAILED_TO_UPDATE_PROPERTY);
            }
        });
    }
    // Delete property
    deleteProperty(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if property exists and belongs to owner
                const existingProperty = yield propertyRepository_1.default.findByIdAndOwner(id, ownerId);
                if (!existingProperty) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_DELETE);
                }
                // Check if property has active bookings
                const hasActiveBookings = yield propertyRepository_1.default.hasActiveBookings(id);
                if (hasActiveBookings) {
                    throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CANNOT_DELETE_PROPERTY_WITH_BOOKINGS);
                }
                // Delete property (this will cascade delete rooms based on your schema)
                yield propertyRepository_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error deleting property with ID ${id}:`, error);
                if (error instanceof Error &&
                    (error.message ===
                        propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
                        error.message ===
                            propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CANNOT_DELETE_PROPERTY_WITH_BOOKINGS)) {
                    throw error;
                }
                throw new Error(propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.FAILED_TO_DELETE_PROPERTY);
            }
        });
    }
}
exports.default = new PropertyService();
