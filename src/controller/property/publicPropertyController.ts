import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import publicPropertyService from "../../service/property/publicPropertyService";
import logger from "../../utils/system/logger";
import { PUBLIC_PROPERTY_SUCCESS_MESSAGES } from "../../constants/controllers/property";
import PublicPropertyValidationHelper from "../../helpers/property/publicPropertyValidationHelper";
import PublicPropertyErrorHelper from "../../helpers/property/publicPropertyErrorHelper";

class PublicPropertyController extends BaseController {
  // GET /api/public/properties - Public property search
  async searchProperties(req: Request, res: Response): Promise<void> {
    try {
      const validation = PublicPropertyValidationHelper.validateSearchQuery(
        req.query
      );
      if (!validation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          validation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      // Map validated query to service parameters
      const serviceParams = {
        search: validation.query!.search,
        category: validation.query!.category,
        city: validation.query!.city,
        province: validation.query!.province,
        minPrice: validation.query!.minPrice,
        maxPrice: validation.query!.maxPrice,
        capacity: validation.query!.capacity,
        sortBy:
          validation.query!.sortBy === "pricing"
            ? "price"
            : (validation.query!.sortBy as
                | "name"
                | "price"
                | "createdAt"
                | "capacity"),
        sortOrder: validation.query!.sortOrder,
        page: validation.query!.page,
        limit: validation.query!.limit,
      };

      const result = await publicPropertyService.searchProperties(
        serviceParams
      );

      ResponseHelper.paginated(
        res,
        PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED,
        result.properties,
        {
          currentPage: result.pagination.page,
          totalItems: result.pagination.total,
          itemsPerPage: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          hasNextPage: result.pagination.page < result.pagination.totalPages,
          hasPrevPage: result.pagination.page > 1,
        }
      );
    } catch (error) {
      logger.error("Error in searchProperties:", error);
      const errorResponse = PublicPropertyErrorHelper.mapError(error, "search");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // GET /api/public/properties/:id - Get property details
  async getPropertyDetails(req: Request, res: Response): Promise<void> {
    try {
      const idValidation = PublicPropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          idValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const property = await publicPropertyService.getPropertyDetails(
        req.params.id
      );

      if (!property) {
        const errorResponse = PublicPropertyErrorHelper.createNotFoundError();
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      ResponseHelper.success(
        res,
        PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED,
        property
      );
    } catch (error) {
      logger.error("Error in getPropertyDetails:", error);
      const errorResponse = PublicPropertyErrorHelper.mapError(
        error,
        "details"
      );
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // GET /api/public/properties/:id/calendar - Get property calendar pricing
  async getPropertyCalendarPricing(req: Request, res: Response): Promise<void> {
    try {
      const idValidation = PublicPropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          idValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const calendarValidation =
        PublicPropertyValidationHelper.validateCalendarQuery(req.query);
      if (!calendarValidation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          calendarValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const property = await publicPropertyService.getCalendarPricing(
        req.params.id,
        30 // Default 30 days
      );

      if (!property) {
        const errorResponse = PublicPropertyErrorHelper.createNotFoundError();
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      ResponseHelper.success(
        res,
        PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_CALENDAR_PRICING_RETRIEVED,
        property
      );
    } catch (error) {
      logger.error("Error in getPropertyCalendarPricing:", error);
      const errorResponse = PublicPropertyErrorHelper.mapError(
        error,
        "calendar"
      );
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // GET /api/public/properties/:id/rooms - Get property rooms
  async getPropertyRooms(req: Request, res: Response): Promise<void> {
    try {
      const idValidation = PublicPropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          idValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const roomValidation = PublicPropertyValidationHelper.validateRoomQuery(
        req.query
      );
      if (!roomValidation.isValid) {
        const errorResponse = PublicPropertyErrorHelper.createValidationError(
          roomValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const property = await publicPropertyService.getPropertyRoomTypes(
        req.params.id
      );

      if (!property) {
        const errorResponse = PublicPropertyErrorHelper.createNotFoundError();
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      ResponseHelper.success(
        res,
        PUBLIC_PROPERTY_SUCCESS_MESSAGES.PROPERTY_ROOMS_RETRIEVED,
        property
      );
    } catch (error) {
      logger.error("Error in getPropertyRooms:", error);
      const errorResponse = PublicPropertyErrorHelper.mapError(error, "rooms");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }
}

export default new PublicPropertyController();
