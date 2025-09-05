import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import flexibleAvailabilityService from "../../service/property/flexibleAvailabilityService";
import {
  PROPERTY_SUCCESS_MESSAGES,
  PROPERTY_ERROR_MESSAGES,
} from "../../constants/controllers/property";
import {
  AvailabilityValidationHelper,
  AvailabilityErrorHelper,
} from "../../helpers/property";

class AvailabilityController extends BaseController {
  /**
   * POST /api/rooms/:id/availability - Bulk set availability
   */
  async setBulkAvailability(req: Request, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        ResponseHelper.error(
          res,
          userValidation.error ||
            PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED,
          undefined,
          401
        );
        return;
      }

      // Validate room ID
      const { id } = req.params;
      const roomIdValidation = AvailabilityValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Validate availability array
      const { availability } = req.body;
      const availabilityValidation =
        AvailabilityValidationHelper.validateAvailabilityArray(availability);
      if (!availabilityValidation.isValid) {
        ResponseHelper.error(
          res,
          availabilityValidation.error!,
          undefined,
          400
        );
        return;
      }

      // Process bulk availability setting
      await flexibleAvailabilityService.setBulkAvailability(
        id,
        availabilityValidation.data!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.ROOM_AVAILABILITY_UPDATED
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "setBulkAvailability",
        AvailabilityErrorHelper.getBulkAvailabilityErrorMappings()
      );
    }
  }

  /**
   * GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability
   */
  async getMonthlyAvailability(req: Request, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        ResponseHelper.error(
          res,
          userValidation.error ||
            PROPERTY_ERROR_MESSAGES.USER_VALIDATION_FAILED,
          undefined,
          401
        );
        return;
      }

      // Validate room ID
      const { id } = req.params;
      const roomIdValidation = AvailabilityValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Validate month parameter
      const { month } = req.query;
      const monthValidation =
        AvailabilityValidationHelper.validateMonthParameter(month);
      if (!monthValidation.isValid) {
        ResponseHelper.error(res, monthValidation.error!, undefined, 400);
        return;
      }

      // Get monthly availability
      const availability =
        await flexibleAvailabilityService.getMonthlyAvailability(
          id,
          monthValidation.year!,
          monthValidation.month!,
          userValidation.userId!
        );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.MONTHLY_AVAILABILITY_RETRIEVED,
        availability
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "getMonthlyAvailability",
        AvailabilityErrorHelper.getMonthlyAvailabilityErrorMappings()
      );
    }
  }
}

export default new AvailabilityController();
