import { RoomType } from "@prisma/client";
import roomTypeRepository from "../../repository/property/roomTypeRepository";
import roomRepository from "../../repository/property/roomRepository";
import logger from "../../utils/system/logger";
import { ROOM_TYPE_SERVICE_ERRORS } from "../../constants/services/roomServiceErrors";
import {
  RoomTypeCreateData,
  RoomTypeUpdateData,
} from "../../interfaces/property/roomType.interface";

class RoomTypeService {
  // Helper function to auto-generate rooms for a room type
  private async autoGenerateRooms(
    roomType: RoomType,
    quantity: number
  ): Promise<void> {
    try {
      // For whole property, quantity is always 1 and we don't create rooms
      if (roomType.isWholeUnit) {
        return;
      }

      // Create rooms based on quantity
      const roomPromises = [];
      for (let i = 1; i <= quantity; i++) {
        const roomName = `${roomType.name}-${String(i).padStart(3, "0")}`;

        const roomData = {
          name: roomName,
          propertyId: roomType.propertyId,
          roomTypeId: roomType.id,
          pictures: [],
        };

        roomPromises.push(roomRepository.create(roomData));
      }

      await Promise.all(roomPromises);

      // Update roomType totalQuantity to reflect actual room count
      await this.updateRoomTypeQuantityByCount(roomType.id);
    } catch (error) {
      logger.error("Error auto-generating rooms:", error);
      throw new Error("Failed to auto-generate rooms for room type");
    }
  }

  // Helper function to update roomType quantity based on actual room count
  private async updateRoomTypeQuantityByCount(
    roomTypeId: string
  ): Promise<void> {
    try {
      const roomCount = await roomRepository.countRoomsByRoomType(roomTypeId);
      await roomTypeRepository.update(roomTypeId, { totalQuantity: roomCount });
    } catch (error) {
      logger.error("Error updating room type quantity:", error);
      throw new Error("Failed to update room type quantity");
    }
  }

  // Helper function to manage rooms quantity when roomType quantity changes
  private async manageRoomsQuantity(
    roomType: RoomType,
    newQuantity: number
  ): Promise<void> {
    try {
      // Skip for whole unit properties
      if (roomType.isWholeUnit) {
        return;
      }

      const currentRoomCount = await roomRepository.countRoomsByRoomType(
        roomType.id
      );

      if (newQuantity > currentRoomCount) {
        // Need to create more rooms
        const roomsToCreate = newQuantity - currentRoomCount;
        const roomPromises = [];

        for (let i = currentRoomCount + 1; i <= newQuantity; i++) {
          const roomName = `${roomType.name}-${String(i).padStart(3, "0")}`;

          const roomData = {
            name: roomName,
            propertyId: roomType.propertyId,
            roomTypeId: roomType.id,
            pictures: [],
          };

          roomPromises.push(roomRepository.create(roomData));
        }

        await Promise.all(roomPromises);
      } else if (newQuantity < currentRoomCount) {
        // Need to remove excess rooms (remove rooms that don't have active bookings)
        const roomsToRemove = currentRoomCount - newQuantity;
        const allRooms = await roomRepository.findAllByRoomType(roomType.id);

        // Sort by created date (newest first) to remove the most recently created rooms
        allRooms.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        let removedCount = 0;
        for (const room of allRooms) {
          if (removedCount >= roomsToRemove) break;

          // Check if room has active bookings
          const hasActiveBookings = await roomRepository.hasActiveBookings(
            room.id
          );
          if (!hasActiveBookings) {
            await roomRepository.delete(room.id);
            removedCount++;
          }
        }

        // If couldn't remove enough rooms due to active bookings, log warning
        if (removedCount < roomsToRemove) {
          logger.warn(
            `Could only remove ${removedCount} out of ${roomsToRemove} rooms due to active bookings`
          );
        }
      }

      // Update the quantity to reflect actual count
      await this.updateRoomTypeQuantityByCount(roomType.id);
    } catch (error) {
      logger.error("Error managing rooms quantity:", error);
      throw new Error("Failed to manage rooms quantity");
    }
  }
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

      // For whole property, set quantity to 1
      if (data.isWholeUnit) {
        roomTypeData.totalQuantity = 1;
      }

      // Create room type first
      const createdRoomType = await roomTypeRepository.create(roomTypeData);

      // Auto-generate rooms based on quantity (except for whole unit)
      if (!data.isWholeUnit) {
        await this.autoGenerateRooms(createdRoomType, data.totalQuantity);
      }

      return createdRoomType;
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

      // Update room type
      const updatedRoomType = await roomTypeRepository.update(id, updateData);

      // Handle quantity changes (create/remove rooms as needed)
      if (
        data.totalQuantity !== undefined &&
        data.totalQuantity !== existingRoomType.totalQuantity
      ) {
        await this.manageRoomsQuantity(updatedRoomType, data.totalQuantity);
      }

      return updatedRoomType;
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
