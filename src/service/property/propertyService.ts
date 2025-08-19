import { Property, Prisma } from "@prisma/client";
import propertyRepository from "../../repository/property/propertyRepository";
import categoryRepository from "../../repository/property/categoryRepository";
import logger from "../../utils/system/logger";
import { PROPERTY_SERVICE_ERRORS } from "../../constants/services/propertyServiceErrors";
import {
  validatePropertyLocation,
  validatePropertyOwnership,
  propertyCreateSchema,
  propertyUpdateSchema,
  PropertyCreateInput,
  PropertyUpdateInput,
} from "../../validations/property/propertyValidation";
import {
  CreatePropertyData,
  UpdatePropertyData,
} from "../../interfaces/property";

class PropertyService {
  // Get all properties owned by owner
  async getAllPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      return await propertyRepository.findAllByOwner(ownerId);
    } catch (error) {
      logger.error("Error fetching owner properties:", error);
      throw new Error(PROPERTY_SERVICE_ERRORS.FAILED_TO_FETCH_PROPERTIES);
    }
  }

  // Get property by ID with authorization check
  async getPropertyById(
    id: string,
    ownerId?: string
  ): Promise<Property | null> {
    try {
      if (ownerId) {
        // If ownerId provided, check ownership
        return await propertyRepository.findByIdAndOwner(id, ownerId);
      } else {
        // For public view
        return await propertyRepository.findById(id);
      }
    } catch (error) {
      logger.error(`Error fetching property with ID ${id}:`, error);
      throw new Error(PROPERTY_SERVICE_ERRORS.FAILED_TO_FETCH_PROPERTY);
    }
  }

  // Create new property
  async createProperty(
    data: CreatePropertyData,
    ownerId: string
  ): Promise<Property> {
    try {
      // Validate input data using schema
      const validationResult = propertyCreateSchema.safeParse(data);
      if (!validationResult.success) {
        throw new Error(validationResult.error.issues[0].message);
      }

      // Validate location fields using centralized validation
      const locationValidation = validatePropertyLocation(
        data.location,
        data.city,
        data.province
      );
      if (!locationValidation.isValid) {
        throw new Error(locationValidation.errors.join(", "));
      }

      // Validate category exists
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error(PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND);
      }

      // Handle location creation (province -> city -> location)
      const provinceId = await propertyRepository.findOrCreateProvince(
        data.province
      );
      const cityId = await propertyRepository.createCityIfNotExists(
        data.city,
        provinceId
      );
      const locationId = await propertyRepository.getOrCreateLocation(
        data.location,
        cityId
      );

      const propertyData = {
        name: data.name,
        description: data.description,
        category: {
          connect: { id: data.categoryId },
        },
        location: {
          connect: { id: locationId },
        },
        Owner: {
          connect: { id: ownerId },
        },
        mainPicture: {
          connect: { id: data.mainPictureId },
        },
      };

      return await propertyRepository.create(propertyData);
    } catch (error) {
      logger.error("Error creating property:", error);
      if (error instanceof Error) {
        if (error.message === PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND) {
          throw error;
        }
      }
      throw new Error(PROPERTY_SERVICE_ERRORS.FAILED_TO_CREATE_PROPERTY);
    }
  }

  // Update property
  async updateProperty(
    id: string,
    data: UpdatePropertyData,
    ownerId: string
  ): Promise<Property> {
    try {
      // Check if property exists and belongs to owner
      const existingProperty = await propertyRepository.findByIdAndOwner(
        id,
        ownerId
      );
      if (!existingProperty) {
        throw new Error(
          PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_UPDATE
        );
      }

      // Validate category if provided
      if (data.categoryId) {
        const category = await categoryRepository.findById(data.categoryId);
        if (!category) {
          throw new Error(PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND);
        }
      }

      // Prepare update data
      const updateData: Prisma.PropertyUpdateInput = {};

      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } };
      }
      if (data.mainPictureId) {
        updateData.mainPicture = { connect: { id: data.mainPictureId } };
      }

      // Handle location update if provided
      if (data.location || data.city || data.province) {
        // For location updates, we'll create new location entry
        // Get default values if not provided
        const province = data.province || "Unknown Province";
        const city = data.city || "Unknown City";
        const address = data.location || "Unknown Address";

        const provinceId = await propertyRepository.findOrCreateProvince(
          province
        );
        const cityId = await propertyRepository.createCityIfNotExists(
          city,
          provinceId
        );
        const locationId = await propertyRepository.getOrCreateLocation(
          address,
          cityId
        );

        updateData.location = { connect: { id: locationId } };
      }

      return await propertyRepository.update(id, updateData);
    } catch (error) {
      logger.error(`Error updating property with ID ${id}:`, error);
      if (
        error instanceof Error &&
        (error.message ===
          PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
          error.message === PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND)
      ) {
        throw error;
      }
      throw new Error(PROPERTY_SERVICE_ERRORS.FAILED_TO_UPDATE_PROPERTY);
    }
  }

  // Delete property
  async deleteProperty(id: string, ownerId: string): Promise<void> {
    try {
      // Check if property exists and belongs to owner
      const existingProperty = await propertyRepository.findByIdAndOwner(
        id,
        ownerId
      );
      if (!existingProperty) {
        throw new Error(
          PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_DELETE
        );
      }

      // Check if property has active bookings
      const hasActiveBookings = await propertyRepository.hasActiveBookings(id);
      if (hasActiveBookings) {
        throw new Error(
          PROPERTY_SERVICE_ERRORS.CANNOT_DELETE_PROPERTY_WITH_BOOKINGS
        );
      }

      // Delete property (this will cascade delete rooms based on your schema)
      await propertyRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting property with ID ${id}:`, error);
      if (
        error instanceof Error &&
        (error.message ===
          PROPERTY_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
          error.message ===
            PROPERTY_SERVICE_ERRORS.CANNOT_DELETE_PROPERTY_WITH_BOOKINGS)
      ) {
        throw error;
      }
      throw new Error(PROPERTY_SERVICE_ERRORS.FAILED_TO_DELETE_PROPERTY);
    }
  }
}

export default new PropertyService();
