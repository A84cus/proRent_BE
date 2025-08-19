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
const roomValidationHelper_1 = __importDefault(require("../../helpers/property/roomValidationHelper"));
const roomService_1 = __importDefault(require("../../service/property/roomService"));
const roomMessages_1 = require("../../constants/controllers/property/roomMessages");
const property_1 = require("../../constants/controllers/property");
class RoomController extends BaseController_1.default {
    // GET /api/owner/rooms?propertyId= - Get all rooms by property
    getRoomsByProperty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user authentication
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                // Validate property ID
                const propertyValidation = roomValidationHelper_1.default.validatePropertyId(req.query.propertyId);
                if (!propertyValidation.isValid) {
                    responseHelper_1.default.error(res, propertyValidation.error, undefined, 400);
                    return;
                }
                // Fetch rooms
                const rooms = yield roomService_1.default.getRoomsByProperty(propertyValidation.cleanId, userValidation.userId);
                responseHelper_1.default.success(res, property_1.ROOM_SUCCESS_MESSAGES.ROOMS_RETRIEVED, rooms);
            }
            catch (error) {
                this.handleError(res, error, "getRoomsByProperty", roomMessages_1.ROOM_ERROR_MESSAGES);
            }
        });
    }
    // POST /api/owner/rooms - Create new room
    createRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user authentication
                const userValidation = this.validateUser(req);
                if (!userValidation.isValid) {
                    responseHelper_1.default.error(res, userValidation.error ||
                        property_1.PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED, undefined, 401);
                    return;
                }
                // Validate room data
                const dataValidation = roomValidationHelper_1.default.validateCreateRoomData(req.body);
                if (!dataValidation.isValid) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.VALIDATION_FAILED, dataValidation.errors, 400);
                    return;
                }
                // Create room
                const newRoom = yield roomService_1.default.createRoom(dataValidation.cleanData, userValidation.userId);
                responseHelper_1.default.success(res, property_1.ROOM_SUCCESS_MESSAGES.ROOM_CREATED, newRoom, 201);
            }
            catch (error) {
                this.handleError(res, error, "createRoom", roomMessages_1.ROOM_ERROR_MESSAGES);
            }
        });
    }
    // PUT /api/owner/rooms/:id - Update room
    updateRoom(req, res) {
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
                const roomIdValidation = roomValidationHelper_1.default.validateRoomId(req.params.id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Validate update data
                const dataValidation = roomValidationHelper_1.default.validateUpdateRoomData(req.body);
                if (!dataValidation.isValid) {
                    responseHelper_1.default.error(res, property_1.PROPERTY_ERROR_MESSAGES.VALIDATION_FAILED, dataValidation.errors, 400);
                    return;
                }
                // Check if there's any data to update
                if (Object.keys(dataValidation.cleanData).length === 0) {
                    responseHelper_1.default.error(res, roomMessages_1.ROOM_ERROR_MESSAGES["No valid data provided for update"].message, undefined, 400);
                    return;
                }
                // Update room
                const updatedRoom = yield roomService_1.default.updateRoom(roomIdValidation.cleanId, dataValidation.cleanData, userValidation.userId);
                responseHelper_1.default.success(res, property_1.ROOM_SUCCESS_MESSAGES.ROOM_UPDATED, updatedRoom);
            }
            catch (error) {
                this.handleError(res, error, "updateRoom", roomMessages_1.ROOM_ERROR_MESSAGES);
            }
        });
    }
    // DELETE /api/owner/rooms/:id - Delete room
    deleteRoom(req, res) {
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
                const roomIdValidation = roomValidationHelper_1.default.validateRoomId(req.params.id);
                if (!roomIdValidation.isValid) {
                    responseHelper_1.default.error(res, roomIdValidation.error, undefined, 400);
                    return;
                }
                // Delete room
                yield roomService_1.default.deleteRoom(roomIdValidation.cleanId, userValidation.userId);
                responseHelper_1.default.success(res, property_1.ROOM_SUCCESS_MESSAGES.ROOM_DELETED, null);
            }
            catch (error) {
                this.handleError(res, error, "deleteRoom", roomMessages_1.ROOM_ERROR_MESSAGES);
            }
        });
    }
}
exports.default = new RoomController();
