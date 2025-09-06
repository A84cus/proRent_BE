import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import peakRateService from "../../service/property/peakRateService";
import {
  PROPERTY_ERROR_MESSAGES,
  PROPERTY_SUCCESS_MESSAGES,
} from "../../constants/controllers/property";
import {
  PeakRateValidationHelper,
  PeakRateErrorHelper,
} from "../../helpers/property";

class PeakRateController extends BaseController {
  /**
   * GET /api/rooms/:id/peak-rates - Get all peak rates for room type
   */
  getPeakRates = async (req: Request, res: Response): Promise<void> => {
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

      // Validate room type ID
      const { id } = req.params;
      const roomIdValidation = PeakRateValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Get peak rates
      const peakRates = await peakRateService.getPeakRatesByRoomType(
        id,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        "Peak rates retrieved successfully",
        peakRates
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "getPeakRates",
        PeakRateErrorHelper.getAddPeakRateErrorMappings()
      );
    }
  };

  /**
   * POST /api/rooms/:id/peak-price - Add peak rate rule
   */
  addPeakRate = async (req: Request, res: Response): Promise<void> => {
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
      const roomIdValidation = PeakRateValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Validate peak rate data
      const dataValidation =
        PeakRateValidationHelper.validateCreatePeakRateData(req.body);
      if (!dataValidation.isValid) {
        ResponseHelper.error(res, dataValidation.error!, undefined, 400);
        return;
      }

      // Add peak rate
      const newPeakRate = await peakRateService.addPeakRate(
        id,
        dataValidation.data!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_ADDED,
        newPeakRate,
        201
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "addPeakRate",
        PeakRateErrorHelper.getAddPeakRateErrorMappings()
      );
    }
  };

  /**
   * PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
   */
  updatePeakRateForDate = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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
      const { id, date } = req.params;
      const roomIdValidation = PeakRateValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Validate date parameter
      const dateValidation = PeakRateValidationHelper.validateDate(date);
      if (!dateValidation.isValid) {
        ResponseHelper.error(res, dateValidation.error!, undefined, 400);
        return;
      }

      // Validate update data
      const dataValidation =
        PeakRateValidationHelper.validateUpdatePeakRateData(req.body);
      if (!dataValidation.isValid) {
        ResponseHelper.error(res, dataValidation.error!, undefined, 400);
        return;
      }

      // Update peak rate
      const updatedPeakRate = await peakRateService.updatePeakRateForDate(
        id,
        date,
        dataValidation.data!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_UPDATED,
        updatedPeakRate
      );
    } catch (error) {
      this.handleError(
        res,
        error,
        "updatePeakRateForDate",
        PeakRateErrorHelper.getUpdatePeakRateErrorMappings()
      );
    }
  };

  /**
   * DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
   */
  removePeakRateForDate = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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
      const { id, date } = req.params;
      const roomIdValidation = PeakRateValidationHelper.validateRoomId(id);
      if (!roomIdValidation.isValid) {
        ResponseHelper.error(res, roomIdValidation.error!, undefined, 400);
        return;
      }

      // Validate date parameter
      const dateValidation = PeakRateValidationHelper.validateDate(date);
      if (!dateValidation.isValid) {
        ResponseHelper.error(res, dateValidation.error!, undefined, 400);
        return;
      }

      // Remove peak rate
      await peakRateService.removePeakRateForDate(
        id,
        date,
        userValidation.userId!
      );

      ResponseHelper.success(res, PROPERTY_SUCCESS_MESSAGES.PEAK_RATE_REMOVED);
    } catch (error) {
      this.handleError(
        res,
        error,
        "removePeakRateForDate",
        PeakRateErrorHelper.getRemovePeakRateErrorMappings()
      );
    }
  };
}

export default new PeakRateController();
