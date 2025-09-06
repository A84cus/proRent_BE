import { Availability } from "@prisma/client";
import availabilityRepository from "../../repository/property/availabilityRepository";
import roomRepository from "../../repository/property/roomRepository";
import roomTypeRepository from "../../repository/property/roomTypeRepository";
import logger from "../../utils/system/logger";
import {
  AvailabilityInput,
  MonthlyAvailabilityResponse,
} from "../../interfaces/property";

class FlexibleAvailabilityService {
  /**
   * Set bulk availability - handles both Room ID and RoomType ID
   */
  async setBulkAvailability(
    id: string,
    availabilityData: AvailabilityInput[],
    ownerId: string
  ): Promise<void> {
    try {
      // First, try to find if it's a Room ID
      const room = await roomRepository.findByIdAndOwner(id, ownerId);

      if (room) {
        // It's a Room ID - set availability for this specific room
        return this.setBulkAvailabilityForRoom(id, availabilityData, ownerId);
      }

      // Try to find if it's a RoomType ID
      const roomType = await roomTypeRepository.findByIdAndOwner(id, ownerId);

      if (roomType) {
        // It's a RoomType ID - set availability for all rooms of this type
        return this.setBulkAvailabilityForRoomType(
          id,
          availabilityData,
          ownerId
        );
      }

      throw new Error("Room or RoomType not found");
    } catch (error) {
      logger.error("Error setting bulk availability:", error);
      throw error;
    }
  }

  /**
   * Get monthly availability - handles both Room ID and RoomType ID
   */
  async getMonthlyAvailability(
    id: string,
    year: number,
    month: number,
    ownerId: string
  ): Promise<MonthlyAvailabilityResponse> {
    try {
      // First, try to find if it's a Room ID
      const room = await roomRepository.findByIdAndOwner(id, ownerId);

      if (room) {
        // It's a Room ID
        return this.getMonthlyAvailabilityForRoom(id, year, month, ownerId);
      }

      // Try to find if it's a RoomType ID
      const roomType = await roomTypeRepository.findByIdAndOwner(id, ownerId);

      if (roomType) {
        // It's a RoomType ID
        return this.getMonthlyAvailabilityForRoomType(id, year, month, ownerId);
      }

      throw new Error("Room or RoomType not found");
    } catch (error) {
      logger.error("Error getting monthly availability:", error);
      throw error;
    }
  }

  // Private methods for Room-level operations
  private async setBulkAvailabilityForRoom(
    roomId: string,
    availabilityData: AvailabilityInput[],
    ownerId: string
  ): Promise<void> {
    const room = await roomRepository.findByIdAndOwner(roomId, ownerId);

    if (!room) {
      throw new Error("Room not found or no permission");
    }

    // Validate and parse dates
    const parsedAvailability = this.validateAndParseDates(availabilityData);

    // Check for existing reservations
    const dates = parsedAvailability.map((item) => item.date);
    const conflicts = await availabilityRepository.getReservationConflicts(
      roomId,
      dates
    );

    if (conflicts.length > 0) {
      throw new Error("Cannot set unavailable dates with active reservations");
    }

    // Set availability for specific room
    await availabilityRepository.bulkUpsertRoomAvailability(
      roomId,
      room.roomTypeId,
      parsedAvailability
    );
  }

  private async setBulkAvailabilityForRoomType(
    roomTypeId: string,
    availabilityData: AvailabilityInput[],
    ownerId: string
  ): Promise<void> {
    const roomType = await roomTypeRepository.findByIdAndOwner(
      roomTypeId,
      ownerId
    );

    if (!roomType) {
      throw new Error("RoomType not found or no permission");
    }

    // Validate and parse dates
    const parsedAvailability = this.validateAndParseDates(availabilityData);

    // Set availability for room type (affects available count for the room type)
    await availabilityRepository.bulkUpsertRoomTypeAvailability(
      roomTypeId,
      parsedAvailability
    );
  }

  private async getMonthlyAvailabilityForRoom(
    roomId: string,
    year: number,
    month: number,
    ownerId: string
  ): Promise<MonthlyAvailabilityResponse> {
    const room = await roomRepository.findByIdAndOwner(roomId, ownerId);

    if (!room) {
      throw new Error("Room not found or no permission");
    }

    const availabilities =
      await availabilityRepository.findRoomAvailabilityByMonth(
        roomId,
        year,
        month
      );

    // Type assertion for room with included relations
    const roomWithRelations = room as any;

    return {
      roomId,
      roomName: room.name || `Room ${roomId.slice(-4)}`,
      roomType: {
        id: roomWithRelations.roomType.id,
        name: roomWithRelations.roomType.name,
        basePrice: Number(roomWithRelations.roomType.basePrice),
      },
      month: `${year}-${month.toString().padStart(2, "0")}`,
      availabilities: availabilities.map((av) => ({
        date: av.date.toISOString().split("T")[0],
        isAvailable: av.availableCount > 0,
        price: Number(roomWithRelations.roomType.basePrice), // Base price, can be adjusted with peak rates
      })),
    };
  }

  private async getMonthlyAvailabilityForRoomType(
    roomTypeId: string,
    year: number,
    month: number,
    ownerId: string
  ): Promise<MonthlyAvailabilityResponse> {
    const roomType = await roomTypeRepository.findByIdAndOwner(
      roomTypeId,
      ownerId
    );

    if (!roomType) {
      throw new Error("RoomType not found or no permission");
    }

    const availabilities =
      await availabilityRepository.findRoomTypeAvailabilityByMonth(
        roomTypeId,
        year,
        month
      );

    return {
      roomId: roomTypeId, // Using roomTypeId as roomId for consistency
      roomName: roomType.name,
      roomType: {
        id: roomType.id,
        name: roomType.name,
        basePrice: Number(roomType.basePrice),
      },
      month: `${year}-${month.toString().padStart(2, "0")}`,
      availabilities: availabilities.map((av) => ({
        date: av.date.toISOString().split("T")[0],
        isAvailable: av.availableCount > 0,
        price: Number(roomType.basePrice),
      })),
    };
  }

  // Helper method for date validation
  private validateAndParseDates(availabilityData: AvailabilityInput[]) {
    return availabilityData.map((item) => {
      // Parse date string manually to avoid timezone issues
      const dateStr = item.date;
      const [year, month, day] = dateStr.split("-").map(Number);

      if (!year || !month || !day) {
        throw new Error(
          `Invalid date format: ${item.date}. Use YYYY-MM-DD format`
        );
      }

      // Create date in local timezone (no UTC conversion)
      const date = new Date(year, month - 1, day, 0, 0, 0, 0);

      if (isNaN(date.getTime())) {
        throw new Error(
          `Invalid date: ${item.date}. Please check the date is valid`
        );
      }

      return {
        date,
        isAvailable: Boolean(item.isAvailable),
      };
    });
  }
}

export default new FlexibleAvailabilityService();
