import { RoomType } from "@prisma/client";
import roomTypeRepository from "../../repository/property/roomTypeRepository";
import logger from "../../utils/system/logger";
import { ROOM_TYPE_SERVICE_ERRORS } from "../../constants/services/roomServiceErrors";
import {
  RoomTypeCreateData,
  RoomTypeUpdateData,
} from "../../interfaces/property/roomType.interface";

class RoomTypeService {
  // Get all room types by property ID
  async getRoomTypesByProperty(
    propertyId: string,
    ownerId: string
  ): Promise<RoomType[]> {
    try {
      // Verify property ownership
      const hasAccess = await roomTypeRepository.verifyPropertyOwnership(
        propertyId,
        ownerId
      );
      if (!hasAccess) {
        throw new Error(
          ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION
        );
      }

      return await roomTypeRepository.findAllByProperty(propertyId);
    } catch (error) {
      logger.error("Error fetching room types by property:", error);
      if (
        error instanceof Error &&
        error.message ===
          ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION
      ) {
        throw error;
      }
      throw new Error(ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM_TYPES);
    }
  }

  // Get room type by ID with authorization check
  async getRoomTypeById(id: string, ownerId: string): Promise<RoomType | null> {
    try {
      return await roomTypeRepository.findByIdAndOwner(id, ownerId);
    } catch (error) {
      logger.error(`Error fetching room type with ID ${id}:`, error);
      throw new Error(ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM_TYPE);
    }
  }

  // Create new room type
  async createRoomType(
    data: RoomTypeCreateData,
    ownerId: string
  ): Promise<RoomType> {
    try {
      // Verify property ownership
      const hasAccess = await roomTypeRepository.verifyPropertyOwnership(
        data.propertyId,
        ownerId
      );
      if (!hasAccess) {
        throw new Error(
          ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION
        );
      }

      // Validate required fields
      if (data.basePrice <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID);
      }

      if (data.capacity <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID);
      }

      if (data.totalQuantity <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID);
      }

      // Check if room type name already exists for this property
      const existingRoomType = await roomTypeRepository.findByNameAndProperty(
        data.name.trim(),
        data.propertyId
      );
      if (existingRoomType) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS);
      }

      const roomTypeData = {
        propertyId: data.propertyId,
        name: data.name.trim(),
        description: data.description?.trim(),
        basePrice: data.basePrice,
        capacity: data.capacity,
        totalQuantity: data.totalQuantity,
        isWholeUnit: data.isWholeUnit || false,
      };

      return await roomTypeRepository.create(roomTypeData);
    } catch (error) {
      logger.error("Error creating room type:", error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_TYPE_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_CREATE_ROOM_TYPE);
    }
  }

  // Update room type
  async updateRoomType(
    id: string,
    data: RoomTypeUpdateData,
    ownerId: string
  ): Promise<RoomType> {
    try {
      // Check if room type exists and belongs to owner's property
      const existingRoomType = await roomTypeRepository.findByIdAndOwner(
        id,
        ownerId
      );
      if (!existingRoomType) {
        throw new Error(
          ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_UPDATE
        );
      }

      // Validate fields if provided
      if (data.basePrice !== undefined && data.basePrice <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID);
      }

      if (data.capacity !== undefined && data.capacity <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID);
      }

      if (data.totalQuantity !== undefined && data.totalQuantity <= 0) {
        throw new Error(ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID);
      }

      // Check if new name conflicts with existing room types
      if (data.name) {
        const conflictingRoomType =
          await roomTypeRepository.findByNameAndProperty(
            data.name.trim(),
            existingRoomType.propertyId
          );
        if (conflictingRoomType && conflictingRoomType.id !== id) {
          throw new Error(ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS);
        }
      }

      // Prepare update data
      const updateData: RoomTypeUpdateData = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined)
        updateData.description = data.description?.trim();
      if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.totalQuantity !== undefined)
        updateData.totalQuantity = data.totalQuantity;

      return await roomTypeRepository.update(id, updateData);
    } catch (error) {
      logger.error(`Error updating room type with ID ${id}:`, error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.BASE_PRICE_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.CAPACITY_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.TOTAL_QUANTITY_INVALID ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NAME_EXISTS ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_UPDATE_ROOM_TYPE);
    }
  }

  // Delete room type
  async deleteRoomType(id: string, ownerId: string): Promise<void> {
    try {
      // Check if room type exists and belongs to owner's property
      const existingRoomType = await roomTypeRepository.findByIdAndOwner(
        id,
        ownerId
      );
      if (!existingRoomType) {
        throw new Error(
          ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_DELETE
        );
      }

      // Check if room type has assigned rooms
      const hasAssignedRooms = await roomTypeRepository.hasAssignedRooms(id);
      if (hasAssignedRooms) {
        throw new Error(
          ROOM_TYPE_SERVICE_ERRORS.CANNOT_DELETE_ROOM_TYPE_WITH_ROOMS
        );
      }

      await roomTypeRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting room type with ID ${id}:`, error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
          error.message ===
            ROOM_TYPE_SERVICE_ERRORS.CANNOT_DELETE_ROOM_TYPE_WITH_ROOMS ||
          error.message === ROOM_TYPE_SERVICE_ERRORS.ROOM_TYPE_NOT_FOUND
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_TYPE_SERVICE_ERRORS.FAILED_TO_DELETE_ROOM_TYPE);
    }
  }
}

export default new RoomTypeService();
