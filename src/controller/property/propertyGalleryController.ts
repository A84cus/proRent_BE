import { Request, Response } from "express";
import propertyGalleryService from "../../service/property/propertyGalleryService";
import ResponseHelper from "../../helpers/system/responseHelper";
import logger from "../../utils/system/logger";
import BaseController from "../BaseController";

class PropertyGalleryController extends BaseController {
  // POST /api/owner/properties/:propertyId/gallery - Add image to property gallery
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

      const { propertyId } = req.params;
      const { pictureId } = req.body;

      if (!propertyId || !pictureId) {
        ResponseHelper.error(
          res,
          "Property ID and Picture ID are required",
          undefined,
          400
        );
        return;
      }

      // Check if property belongs to user
      const propertyExists =
        await propertyGalleryService.verifyPropertyOwnership(
          propertyId,
          userValidation.userId!
        );

      if (!propertyExists) {
        ResponseHelper.error(
          res,
          "Property not found or unauthorized",
          undefined,
          404
        );
        return;
      }

      // Add to gallery
      const result = await propertyGalleryService.addToGallery(
        propertyId,
        pictureId
      );

      ResponseHelper.success(
        res,
        "Image added to gallery successfully",
        result
      );
    } catch (error) {
      logger.error("Error adding image to gallery:", error);
      ResponseHelper.error(
        res,
        "Failed to add image to gallery",
        undefined,
        500
      );
    }
  }

  // DELETE /api/owner/properties/:propertyId/gallery/:pictureId - Remove image from gallery
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

      const { propertyId, pictureId } = req.params;

      // Check if property belongs to user
      const propertyExists =
        await propertyGalleryService.verifyPropertyOwnership(
          propertyId,
          userValidation.userId!
        );

      if (!propertyExists) {
        ResponseHelper.error(
          res,
          "Property not found or unauthorized",
          undefined,
          404
        );
        return;
      }

      // Remove from gallery
      await propertyGalleryService.removeFromGallery(propertyId, pictureId);

      ResponseHelper.success(
        res,
        "Image removed from gallery successfully",
        null
      );
    } catch (error) {
      logger.error("Error removing image from gallery:", error);
      ResponseHelper.error(
        res,
        "Failed to remove image from gallery",
        undefined,
        500
      );
    }
  }

  // PATCH /api/owner/properties/:propertyId/gallery/:pictureId/set-main - Set image as main picture
  async setMainPicture(req: Request, res: Response): Promise<void> {
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

      const { propertyId, pictureId } = req.params;

      // Check if property belongs to user
      const propertyExists =
        await propertyGalleryService.verifyPropertyOwnership(
          propertyId,
          userValidation.userId!
        );

      if (!propertyExists) {
        ResponseHelper.error(
          res,
          "Property not found or unauthorized",
          undefined,
          404
        );
        return;
      }

      // Set as main picture
      const result = await propertyGalleryService.setMainPicture(
        propertyId,
        pictureId
      );

      ResponseHelper.success(res, "Main picture updated successfully", result);
    } catch (error) {
      logger.error("Error setting main picture:", error);
      ResponseHelper.error(res, "Failed to set main picture", undefined, 500);
    }
  }
}

export default new PropertyGalleryController();
