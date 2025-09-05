import { Request, Response } from "express";
import roomGalleryService from "../../service/property/roomGalleryService";
import ResponseHelper from "../../helpers/system/responseHelper";
import logger from "../../utils/system/logger";
import BaseController from "../BaseController";

class RoomGalleryController extends BaseController {
  // POST /api/owner/rooms/:roomId/gallery - Add image to room gallery
  async addToGallery(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        ResponseHelper.error(
          res,
          userValidation.error || "Unauthorized",
          undefined,
          401
        );
        return;
      }

      const { roomId } = req.params;
      const { pictureId } = req.body;

      if (!roomId || !pictureId) {
        ResponseHelper.error(
          res,
          "Room ID and Picture ID are required",
          undefined,
          400
        );
        return;
      }

      // Check if room belongs to user's property
      const hasAccess = await roomGalleryService.verifyRoomOwnership(
        roomId,
        userValidation.userId!
      );

      if (!hasAccess) {
        ResponseHelper.error(
          res,
          "Room not found or unauthorized",
          undefined,
          404
        );
        return;
      }

      // Add to gallery
      const result = await roomGalleryService.addToGallery(roomId, pictureId);

      ResponseHelper.success(
        res,
        "Image added to room gallery successfully",
        result
      );
    } catch (error) {
      logger.error("Error adding image to room gallery:", error);
      ResponseHelper.error(
        res,
        "Failed to add image to room gallery",
        undefined,
        500
      );
    }
  }

  // DELETE /api/owner/rooms/:roomId/gallery/:pictureId - Remove image from room gallery
  async removeFromGallery(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        ResponseHelper.error(
          res,
          userValidation.error || "Unauthorized",
          undefined,
          401
        );
        return;
      }

      const { roomId, pictureId } = req.params;

      // Check if room belongs to user's property
      const hasAccess = await roomGalleryService.verifyRoomOwnership(
        roomId,
        userValidation.userId!
      );

      if (!hasAccess) {
        ResponseHelper.error(
          res,
          "Room not found or unauthorized",
          undefined,
          404
        );
        return;
      }

      // Remove from gallery
      await roomGalleryService.removeFromGallery(roomId, pictureId);

      ResponseHelper.success(
        res,
        "Image removed from room gallery successfully",
        null
      );
    } catch (error) {
      logger.error("Error removing image from room gallery:", error);
      ResponseHelper.error(
        res,
        "Failed to remove image from room gallery",
        undefined,
        500
      );
    }
  }
}

export default new RoomGalleryController();
