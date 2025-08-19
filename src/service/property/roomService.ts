import { Room } from "@prisma/client";
import roomRepository from "../../repository/property/roomRepository";
import logger from "../../utils/system/logger";
import { ROOM_SERVICE_ERRORS } from "../../constants/services/roomServiceErrors";
import { RoomCreateData, RoomUpdateData } from "../../interfaces";

class RoomService {
  // Get all rooms by property ID
  async getRoomsByProperty(
    propertyId: string,
    ownerId: string
  ): Promise<Room[]> {
    try {
      // Verify property ownership
      const hasAccess = await roomRepository.verifyPropertyOwnership(
        propertyId,
        ownerId
      );
      if (!hasAccess) {
        throw new Error(
          ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION
        );
      }

      return await roomRepository.findAllByProperty(propertyId);
    } catch (error) {
      logger.error("Error fetching rooms by property:", error);
      if (
        error instanceof Error &&
        error.message ===
          ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_PERMISSION
      ) {
        throw error;
      }
      throw new Error(ROOM_SERVICE_ERRORS.FAILED_TO_FETCH_ROOMS);
    }
  }

  // Get room by ID with authorization check
  async getRoomById(id: string, ownerId: string): Promise<Room | null> {
    try {
      return await roomRepository.findByIdAndOwner(id, ownerId);
    } catch (error) {
      logger.error(`Error fetching room with ID ${id}:`, error);
      throw new Error(ROOM_SERVICE_ERRORS.FAILED_TO_FETCH_ROOM);
    }
  }

  // Create new room
  async createRoom(data: RoomCreateData, ownerId: string): Promise<Room> {
    try {
      // Verify property ownership
      const hasAccess = await roomRepository.verifyPropertyOwnership(
        data.propertyId,
        ownerId
      );
      if (!hasAccess) {
        throw new Error(
          ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION
        );
      }

      // Validate price and capacity
      if (data.basePrice <= 0) {
        throw new Error(ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID);
      }

      if (data.capacity <= 0) {
        throw new Error(ROOM_SERVICE_ERRORS.CAPACITY_INVALID);
      }

      const roomData = {
        name: data.name.trim(),
        propertyId: data.propertyId,
        roomTypeName: data.roomTypeName.trim(),
        description: data.description?.trim(),
        basePrice: data.basePrice,
        capacity: data.capacity,
        pictures: data.pictures || [],
      };

      return await roomRepository.createWithRoomType(roomData);
    } catch (error) {
      logger.error("Error creating room:", error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_SERVICE_ERRORS.PROPERTY_NOT_FOUND_OR_NO_CREATE_PERMISSION ||
          error.message === ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID ||
          error.message === ROOM_SERVICE_ERRORS.CAPACITY_INVALID
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_SERVICE_ERRORS.FAILED_TO_CREATE_ROOM);
    }
  }

  // Update room
  async updateRoom(
    id: string,
    data: RoomUpdateData,
    ownerId: string
  ): Promise<Room> {
    try {
      // Check if room exists and belongs to owner's property
      const existingRoom = await roomRepository.findByIdAndOwner(id, ownerId);
      if (!existingRoom) {
        throw new Error(
          ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE
        );
      }

      // Validate price and capacity if provided
      if (data.basePrice !== undefined && data.basePrice <= 0) {
        throw new Error(ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID);
      }

      if (data.capacity !== undefined && data.capacity <= 0) {
        throw new Error(ROOM_SERVICE_ERRORS.CAPACITY_INVALID);
      }

      // Prepare update data
      const updateData: RoomUpdateData = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined)
        updateData.description = data.description?.trim();
      if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.pictures !== undefined) updateData.pictures = data.pictures;

      return await roomRepository.updateRoomAndType(id, updateData);
    } catch (error) {
      logger.error(`Error updating room with ID ${id}:`, error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_UPDATE ||
          error.message === ROOM_SERVICE_ERRORS.BASE_PRICE_INVALID ||
          error.message === ROOM_SERVICE_ERRORS.CAPACITY_INVALID ||
          error.message === ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_SERVICE_ERRORS.FAILED_TO_UPDATE_ROOM);
    }
  }

  // Delete room
  async deleteRoom(id: string, ownerId: string): Promise<void> {
    try {
      // Check if room exists and belongs to owner's property
      const existingRoom = await roomRepository.findByIdAndOwner(id, ownerId);
      if (!existingRoom) {
        throw new Error(
          ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE
        );
      }

      // Check if room has active bookings
      const hasActiveBookings = await roomRepository.hasActiveBookings(id);
      if (hasActiveBookings) {
        throw new Error(ROOM_SERVICE_ERRORS.CANNOT_DELETE_ROOM_WITH_BOOKINGS);
      }

      await roomRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting room with ID ${id}:`, error);
      if (error instanceof Error) {
        if (
          error.message ===
            ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND_OR_NO_PERMISSION_DELETE ||
          error.message ===
            ROOM_SERVICE_ERRORS.CANNOT_DELETE_ROOM_WITH_BOOKINGS ||
          error.message === ROOM_SERVICE_ERRORS.ROOM_NOT_FOUND
        ) {
          throw error;
        }
      }
      throw new Error(ROOM_SERVICE_ERRORS.FAILED_TO_DELETE_ROOM);
    }
  }
}

export default new RoomService();
