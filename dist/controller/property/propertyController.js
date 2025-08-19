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
const propertyService_1 = __importDefault(require("../../service/property/propertyService"));
const property_1 = require("../../constants/controllers/property");
class PropertyController extends BaseController_1.default {
    // GET /api/owner/properties - List all properties owned by owner
    getAllProperties(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                const properties = yield propertyService_1.default.getAllPropertiesByOwner(userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED, properties);
            }
            catch (error) {
                this.handleError(res, error, "getAllProperties", {
                    "Failed to fetch properties": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_PROPERTIES,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // GET /api/owner/properties/:id - Get property details
    getPropertyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userValidation = this.validateUser(req);
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                // For owner endpoints, validate ownership
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                const property = yield propertyService_1.default.getPropertyById(id, userValidation.userId);
                if (!property) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND_OR_NO_PERMISSION, undefined, 404);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED, property);
            }
            catch (error) {
                this.handleError(res, error, "getPropertyById", {
                    "Failed to fetch property": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.FAILED_TO_FETCH_PROPERTY,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // POST /api/owner/properties - Create new property
    createProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                const { name, categoryId, description, mainPictureId, location, city, province, } = req.body;
                // Validation
                if (!name || typeof name !== "string" || name.trim().length === 0) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_REQUIRED, undefined, 400);
                    return;
                }
                if (!categoryId || typeof categoryId !== "string") {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_REQUIRED, undefined, 400);
                    return;
                }
                if (!description ||
                    typeof description !== "string" ||
                    description.trim().length === 0) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_REQUIRED, undefined, 400);
                    return;
                }
                if (!mainPictureId || typeof mainPictureId !== "string") {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_REQUIRED, undefined, 400);
                    return;
                }
                if (!location ||
                    typeof location !== "string" ||
                    location.trim().length === 0) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.LOCATION_ADDRESS_REQUIRED, undefined, 400);
                    return;
                }
                if (!city || typeof city !== "string" || city.trim().length === 0) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.CITY_REQUIRED, undefined, 400);
                    return;
                }
                if (!province ||
                    typeof province !== "string" ||
                    province.trim().length === 0) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_REQUIRED, undefined, 400);
                    return;
                }
                const propertyData = {
                    name: name.trim(),
                    categoryId: categoryId.trim(),
                    description: description.trim(),
                    mainPictureId: mainPictureId.trim(),
                    location: location.trim(),
                    city: city.trim(),
                    province: province.trim(),
                };
                const newProperty = yield propertyService_1.default.createProperty(propertyData, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_CREATED, newProperty, 201);
            }
            catch (error) {
                this.handleError(res, error, "createProperty", {
                    "Category not found": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
                        statusCode: 404,
                    },
                    "Failed to create property": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_CREATION_FAILED,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // PATCH /api/owner/properties/:id - Update property
    updateProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                const { name, categoryId, description, mainPictureId, location, city, province, } = req.body;
                // Check if at least one field is provided
                if (!name &&
                    !categoryId &&
                    !description &&
                    !mainPictureId &&
                    !location &&
                    !city &&
                    !province) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.UPDATE_FIELDS_REQUIRED, undefined, 400);
                    return;
                }
                // Validation for provided fields
                if (name !== undefined &&
                    (typeof name !== "string" || name.trim().length === 0)) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NAME_MUST_BE_NON_EMPTY_STRING, undefined, 400);
                    return;
                }
                if (categoryId !== undefined && typeof categoryId !== "string") {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_ID_MUST_BE_STRING, undefined, 400);
                    return;
                }
                if (description !== undefined &&
                    (typeof description !== "string" || description.trim().length === 0)) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.DESCRIPTION_MUST_BE_NON_EMPTY_STRING, undefined, 400);
                    return;
                }
                if (mainPictureId !== undefined && typeof mainPictureId !== "string") {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.MAIN_PICTURE_ID_MUST_BE_STRING, undefined, 400);
                    return;
                }
                if (location !== undefined &&
                    (typeof location !== "string" || location.trim().length === 0)) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.LOCATION_MUST_BE_NON_EMPTY_STRING, undefined, 400);
                    return;
                }
                if (city !== undefined &&
                    (typeof city !== "string" || city.trim().length === 0)) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.CITY_MUST_BE_NON_EMPTY_STRING, undefined, 400);
                    return;
                }
                if (province !== undefined &&
                    (typeof province !== "string" || province.trim().length === 0)) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROVINCE_MUST_BE_NON_EMPTY_STRING, undefined, 400);
                    return;
                }
                const updateData = {};
                if (name !== undefined)
                    updateData.name = name.trim();
                if (categoryId !== undefined)
                    updateData.categoryId = categoryId.trim();
                if (description !== undefined)
                    updateData.description = description.trim();
                if (mainPictureId !== undefined)
                    updateData.mainPictureId = mainPictureId.trim();
                if (location !== undefined)
                    updateData.location = location.trim();
                if (city !== undefined)
                    updateData.city = city.trim();
                if (province !== undefined)
                    updateData.province = province.trim();
                const updatedProperty = yield propertyService_1.default.updateProperty(id, updateData, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_UPDATED, updatedProperty);
            }
            catch (error) {
                this.handleError(res, error, "updateProperty", {
                    "Property not found or you don't have permission to update it": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND_OR_NO_UPDATE_PERMISSION,
                        statusCode: 404,
                    },
                    "Category not found": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.CATEGORY_NOT_FOUND,
                        statusCode: 404,
                    },
                    "Failed to update property": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_UPDATE_FAILED,
                        statusCode: 500,
                    },
                });
            }
        });
    }
    // DELETE /api/owner/properties/:id - Delete property
    deleteProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                if (!id) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED, undefined, 400);
                    return;
                }
                yield propertyService_1.default.deleteProperty(id, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_DELETED);
            }
            catch (error) {
                this.handleError(res, error, "deleteProperty", {
                    "Property not found or you don't have permission to delete it": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_NOT_FOUND_OR_NO_DELETE_PERMISSION,
                        statusCode: 404,
                    },
                    "Cannot delete property with active bookings": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.CANNOT_DELETE_PROPERTY_WITH_ACTIVE_BOOKINGS,
                        statusCode: 409,
                    },
                    "Failed to delete property": {
                        message: property_1.PROPERTY_ERROR_MESSAGES.PROPERTY_DELETION_FAILED,
                        statusCode: 500,
                    },
                });
            }
        });
    }
}
exports.default = new PropertyController();
