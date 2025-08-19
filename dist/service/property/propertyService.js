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
const logger_1 = __importDefault(require("../../utils/system/logger"));
const propertyServiceErrors_1 = require("../../constants/services/propertyServiceErrors");
const propertyValidation_1 = require("../../validations/property/propertyValidation");
class PropertyService {
    // Get all properties owned by owner
    getAllPropertiesByOwner(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield propertyRepository_1.default.findAllByOwner(ownerId);
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
                // Handle location creation (province -> city -> location)
                const provinceId = yield propertyRepository_1.default.findOrCreateProvince(data.province);
                const cityId = yield propertyRepository_1.default.createCityIfNotExists(data.city, provinceId);
                const locationId = yield propertyRepository_1.default.getOrCreateLocation(data.location, cityId);
                const propertyData = {
                    name: data.name,
                    description: data.description,
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
                    if (error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND) {
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
                // Prepare update data
                const updateData = {};
                if (data.name)
                    updateData.name = data.name;
                if (data.description)
                    updateData.description = data.description;
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
                        error.message === propertyServiceErrors_1.PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND)) {
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
