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
const logger_1 = __importDefault(require("../../utils/system/logger"));
const property_1 = require("../../constants/controllers/property");
const propertyValidationHelper_1 = __importDefault(require("../../helpers/property/propertyValidationHelper"));
const propertyErrorHelper_1 = __importDefault(require("../../helpers/property/propertyErrorHelper"));
class PropertyController extends BaseController_1.default {
    // GET /api/owner/properties - List all properties owned by owner
    getAllProperties(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createUnauthorizedError(userValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const properties = yield propertyService_1.default.getAllPropertiesByOwner(userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED, properties);
            }
            catch (error) {
                logger_1.default.error("Error in getAllProperties:", error);
                const errorResponse = propertyErrorHelper_1.default.mapError(error, "fetch");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // GET /api/owner/properties/:id - Get property by ID
    getPropertyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createUnauthorizedError(userValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const idValidation = propertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const property = yield propertyService_1.default.getPropertyById(req.params.id, userValidation.userId);
                if (!property) {
                    const errorResponse = propertyErrorHelper_1.default.createNotFoundError();
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED, property);
            }
            catch (error) {
                logger_1.default.error("Error in getPropertyById:", error);
                const errorResponse = propertyErrorHelper_1.default.mapError(error, "fetchById");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // POST /api/owner/properties - Create new property
    createProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createUnauthorizedError(userValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const dataValidation = propertyValidationHelper_1.default.validateCreatePropertyData(req.body);
                if (!dataValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createValidationError(dataValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const newProperty = yield propertyService_1.default.createProperty(dataValidation.data, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_CREATED, newProperty, 201);
            }
            catch (error) {
                logger_1.default.error("Error in createProperty:", error);
                const errorResponse = propertyErrorHelper_1.default.mapError(error, "create");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // PUT /api/owner/properties/:id - Update property
    updateProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createUnauthorizedError(userValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const idValidation = propertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const dataValidation = propertyValidationHelper_1.default.validateUpdatePropertyData(req.body);
                if (!dataValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createValidationError(dataValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const updatedProperty = yield propertyService_1.default.updateProperty(req.params.id, dataValidation.data, userValidation.userId);
                if (!updatedProperty) {
                    const errorResponse = propertyErrorHelper_1.default.createNotFoundError();
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_UPDATED, updatedProperty);
            }
            catch (error) {
                logger_1.default.error("Error in updateProperty:", error);
                const errorResponse = propertyErrorHelper_1.default.mapError(error, "update");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
    // DELETE /api/owner/properties/:id - Delete property
    deleteProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createUnauthorizedError(userValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                const idValidation = propertyValidationHelper_1.default.validatePropertyId(req.params.id);
                if (!idValidation.isValid) {
                    const errorResponse = propertyErrorHelper_1.default.createValidationError(idValidation.error);
                    responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
                    return;
                }
                yield propertyService_1.default.deleteProperty(req.params.id, userValidation.userId);
                responseHelper_1.default.success(res, property_1.PROPERTY_SUCCESS_MESSAGES.PROPERTY_DELETED, { id: req.params.id });
            }
            catch (error) {
                logger_1.default.error("Error in deleteProperty:", error);
                const errorResponse = propertyErrorHelper_1.default.mapError(error, "delete");
                responseHelper_1.default.error(res, errorResponse.message, undefined, errorResponse.status);
            }
        });
    }
}
exports.default = new PropertyController();
