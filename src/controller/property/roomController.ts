import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import RoomValidationHelper from "../../helpers/property/roomValidationHelper";
import RoomErrorHelper from "../../helpers/property/roomErrorHelper";
import roomService from "../../service/property/roomService";
import logger from "../../utils/system/logger";
import { ROOM_SUCCESS_MESSAGES } from "../../constants/controllers/property";

class RoomController extends BaseController {
  // GET /api/owner/rooms?propertyId= - Get all rooms by property
  async getRoomsByProperty(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = RoomErrorHelper.createUnauthorizedError(userValidation.error);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const propertyValidation = RoomValidationHelper.validatePropertyId(req.query.propertyId);
      if (!propertyValidation.isValid) {
        const errorResponse = RoomErrorHelper.createValidationError(propertyValidation.error!);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const rooms = await roomService.getRoomsByProperty(
        propertyValidation.cleanId!,
        userValidation.userId!
      );

      ResponseHelper.success(res, ROOM_SUCCESS_MESSAGES.ROOMS_RETRIEVED, rooms);
    } catch (error) {
      logger.error("Error in getRoomsByProperty:", error);
      const errorResponse = RoomErrorHelper.mapError(error, "getRoomsByProperty");
      ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
    }
  }

  // POST /api/owner/rooms - Create new room
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = RoomErrorHelper.createUnauthorizedError(userValidation.error);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const dataValidation = RoomValidationHelper.validateCreateRoomData(req.body);
      if (!dataValidation.isValid) {
        const errorResponse = RoomErrorHelper.createValidationError("Validation failed");
        ResponseHelper.error(res, errorResponse.message, dataValidation.errors, errorResponse.status);
        return;
      }

      const newRoom = await roomService.createRoom(
        dataValidation.cleanData!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        ROOM_SUCCESS_MESSAGES.ROOM_CREATED,
        newRoom,
        201
      );
    } catch (error) {
      logger.error("Error in createRoom:", error);
      const errorResponse = RoomErrorHelper.mapError(error, "createRoom");
      ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
    }
  }

  // PUT /api/owner/rooms/:id - Update room
  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = RoomErrorHelper.createUnauthorizedError(userValidation.error);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const idValidation = RoomValidationHelper.validateRoomId(req.params.id);
      if (!idValidation.isValid) {
        const errorResponse = RoomErrorHelper.createValidationError(idValidation.error!);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const dataValidation = RoomValidationHelper.validateUpdateRoomData(req.body);
      if (!dataValidation.isValid) {
        const errorResponse = RoomErrorHelper.createValidationError("Validation failed");
        ResponseHelper.error(res, errorResponse.message, dataValidation.errors, errorResponse.status);
        return;
      }

      const updatedRoom = await roomService.updateRoom(
        idValidation.cleanId!,
        dataValidation.cleanData!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        ROOM_SUCCESS_MESSAGES.ROOM_UPDATED,
        updatedRoom
      );
    } catch (error) {
      logger.error("Error in updateRoom:", error);
      const errorResponse = RoomErrorHelper.mapError(error, "updateRoom");
      ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
    }
  }

  // DELETE /api/owner/rooms/:id - Delete room
  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = RoomErrorHelper.createUnauthorizedError(userValidation.error);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      const idValidation = RoomValidationHelper.validateRoomId(req.params.id);
      if (!idValidation.isValid) {
        const errorResponse = RoomErrorHelper.createValidationError(idValidation.error!);
        ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
        return;
      }

      await roomService.deleteRoom(idValidation.cleanId!, userValidation.userId!);

      ResponseHelper.success(
        res,
        ROOM_SUCCESS_MESSAGES.ROOM_DELETED,
        { id: idValidation.cleanId }
      );
    } catch (error) {
      logger.error("Error in deleteRoom:", error);
      const errorResponse = RoomErrorHelper.mapError(error, "deleteRoom");
      ResponseHelper.error(res, errorResponse.message, undefined, errorResponse.status);
    }
  }
}

export default new RoomController();
