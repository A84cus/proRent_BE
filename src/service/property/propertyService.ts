import { Property, Prisma } from "@prisma/client";
import propertyRepository from "../../repository/property/propertyRepository";
import categoryRepository from "../../repository/property/categoryRepository";
import publicPropertyService from "./publicPropertyService";
import logger from "../../utils/system/logger";
import { PROPERTY_SERVICE_ERRORS } from "../../constants/services/propertyServiceErrors";
import { PropertySearchParams } from "../../interfaces/publicProperty.interface";
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
  // Get all properties owned by owner with filtering and pagination
  async getAllPropertiesByOwner(
    ownerId: string,
    searchParams?: PropertySearchParams
  ): Promise<{
    properties: Array<{
      id: string;
      name: string;
      description: string;
      category: { id: string; name: string };
      location: {
        address: string | null;
        city: string;
        province: string;
      };
      mainPicture: { id: string; url: string } | null;
      priceRange: {
        min: number;
        max: number;
      };
      roomCount: number;
      capacity: number;
      createdAt: Date;
    }>;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      // If search params provided, use filtered search with pagination
      if (searchParams) {
        return await publicPropertyService.getOwnerProperties({
          ...searchParams,
          ownerId,
        });
      }

      // Otherwise, get all properties (backward compatibility)
      const properties = await propertyRepository.findAllByOwner(ownerId);

      // Transform to match the expected format
      const transformedProperties = properties.map((property: any) => ({
        id: property.id,
        name: property.name,
        description: property.description,
        rentalType: property.rentalType,
        category: property.category,
        location: {
          address: property.location?.address || null,
          city: property.location?.city?.name || "",
          province: property.location?.city?.province?.name || "",
        },
        mainPicture: property.mainPicture,
        priceRange: {
          min:
            property.roomTypes?.length > 0
              ? Math.min(
                  ...property.roomTypes.map((rt: any) => Number(rt.basePrice))
                )
              : 0,
          max:
            property.roomTypes?.length > 0
              ? Math.max(
                  ...property.roomTypes.map((rt: any) => Number(rt.basePrice))
                )
              : 0,
        },
        roomCount: property._count?.rooms || 0,
        capacity:
          property.roomTypes?.length > 0
            ? Math.max(...property.roomTypes.map((rt: any) => rt.capacity))
            : 0,
        rooms: property.rooms || [],
        roomTypes: property.roomTypes || [],
        createdAt: property.createdAt,
      }));

      return { properties: transformedProperties };
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

      // Validate rental type
      if (!["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(data.rentalType)) {
        throw new Error(PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE);
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
        cityId,
        data.latitude,
        data.longitude
      );

      const propertyData = {
        name: data.name,
        description: data.description,
        rentalType: data.rentalType, // Handle rental type
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
        if (
          error.message === PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND ||
          error.message === PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE
        ) {
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

      // Validate rental type if provided
      if (
        data.rentalType &&
        !["WHOLE_PROPERTY", "ROOM_BY_ROOM"].includes(data.rentalType)
      ) {
        throw new Error(PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE);
      }

      // Prepare update data
      const updateData: Prisma.PropertyUpdateInput = {};

      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.rentalType) updateData.rentalType = data.rentalType; // Handle rental type update
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
          error.message === PROPERTY_SERVICE_ERRORS.CATEGORY_NOT_FOUND ||
          error.message === PROPERTY_SERVICE_ERRORS.INVALID_RENTAL_TYPE)
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
