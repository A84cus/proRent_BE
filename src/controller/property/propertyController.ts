import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import propertyService from "../../service/property/propertyService";
import logger from "../../utils/system/logger";
import { PROPERTY_SUCCESS_MESSAGES } from "../../constants/controllers/property";
import PropertyValidationHelper from "../../helpers/property/propertyValidationHelper";
import PropertyErrorHelper from "../../helpers/property/propertyErrorHelper";

class PropertyController extends BaseController {
  // GET /api/owner/properties - List all properties owned by owner
  async getAllProperties(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createUnauthorizedError(
          userValidation.error
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      // Extract query parameters for filtering
      const {
        search,
        category,
        city,
        province,
        minPrice,
        maxPrice,
        capacity,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query;

      // Build search params if any filters are provided
      let searchParams = undefined;
      if (
        search ||
        category ||
        city ||
        province ||
        minPrice ||
        maxPrice ||
        capacity ||
        sortBy ||
        sortOrder ||
        page ||
        limit
      ) {
        searchParams = {
          search: search ? String(search) : undefined,
          category: category ? String(category) : undefined,
          city: city ? String(city) : undefined,
          province: province ? String(province) : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          capacity: capacity ? Number(capacity) : undefined,
          sortBy: sortBy
            ? (String(sortBy) as "name" | "price" | "createdAt" | "capacity")
            : undefined,
          sortOrder: sortOrder
            ? (String(sortOrder) as "asc" | "desc")
            : undefined,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
        };
      }

      const result = await propertyService.getAllPropertiesByOwner(
        userValidation.userId!,
        searchParams
      );

      if (result.pagination) {
        // Return paginated response
        ResponseHelper.paginated(
          res,
          PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED,
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
      } else {
        // Return simple response
        ResponseHelper.success(
          res,
          PROPERTY_SUCCESS_MESSAGES.PROPERTIES_RETRIEVED,
          result.properties
        );
      }
    } catch (error) {
      logger.error("Error in getAllProperties:", error);
      const errorResponse = PropertyErrorHelper.mapError(error, "fetch");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // GET /api/owner/properties/:id - Get property by ID
  async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createUnauthorizedError(
          userValidation.error
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const idValidation = PropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createValidationError(
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

      const property = await propertyService.getPropertyById(
        req.params.id,
        userValidation.userId!
      );

      if (!property) {
        const errorResponse = PropertyErrorHelper.createNotFoundError();
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
        PROPERTY_SUCCESS_MESSAGES.PROPERTY_DETAILS_RETRIEVED,
        property
      );
    } catch (error) {
      logger.error("Error in getPropertyById:", error);
      const errorResponse = PropertyErrorHelper.mapError(error, "fetchById");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // POST /api/owner/properties - Create new property
  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createUnauthorizedError(
          userValidation.error
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const dataValidation =
        PropertyValidationHelper.validateCreatePropertyData(req.body);
      if (!dataValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createValidationError(
          dataValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const newProperty = await propertyService.createProperty(
        dataValidation.data!,
        userValidation.userId!
      );

      ResponseHelper.success(
        res,
        PROPERTY_SUCCESS_MESSAGES.PROPERTY_CREATED,
        newProperty,
        201
      );
    } catch (error) {
      logger.error("Error in createProperty:", error);
      const errorResponse = PropertyErrorHelper.mapError(error, "create");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // PUT /api/owner/properties/:id - Update property
  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createUnauthorizedError(
          userValidation.error
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const idValidation = PropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createValidationError(
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

      const dataValidation =
        PropertyValidationHelper.validateUpdatePropertyData(req.body);
      if (!dataValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createValidationError(
          dataValidation.error!
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const updatedProperty = await propertyService.updateProperty(
        req.params.id,
        dataValidation.data!,
        userValidation.userId!
      );

      if (!updatedProperty) {
        const errorResponse = PropertyErrorHelper.createNotFoundError();
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
        PROPERTY_SUCCESS_MESSAGES.PROPERTY_UPDATED,
        updatedProperty
      );
    } catch (error) {
      logger.error("Error in updateProperty:", error);
      const errorResponse = PropertyErrorHelper.mapError(error, "update");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }

  // DELETE /api/owner/properties/:id - Delete property
  async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const userValidation = this.validateUser(req);
      if (!userValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createUnauthorizedError(
          userValidation.error
        );
        ResponseHelper.error(
          res,
          errorResponse.message,
          undefined,
          errorResponse.status
        );
        return;
      }

      const idValidation = PropertyValidationHelper.validatePropertyId(
        req.params.id
      );
      if (!idValidation.isValid) {
        const errorResponse = PropertyErrorHelper.createValidationError(
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

      await propertyService.deleteProperty(
        req.params.id,
        userValidation.userId!
      );

      ResponseHelper.success(res, PROPERTY_SUCCESS_MESSAGES.PROPERTY_DELETED, {
        id: req.params.id,
      });
    } catch (error) {
      logger.error("Error in deleteProperty:", error);
      const errorResponse = PropertyErrorHelper.mapError(error, "delete");
      ResponseHelper.error(
        res,
        errorResponse.message,
        undefined,
        errorResponse.status
      );
    }
  }
}

export default new PropertyController();
