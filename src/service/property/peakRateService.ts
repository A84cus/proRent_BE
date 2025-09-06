import { PeakRate, RateType } from "@prisma/client";
import peakRateRepository from "../../repository/property/peakRateRepository";
import logger from "../../utils/system/logger";
import {
  CreatePeakRateData,
  UpdatePeakRateData,
} from "../../interfaces/property";

class PeakRateService {
  // Add peak rate rule
  async addPeakRate(
    roomTypeId: string,
    data: CreatePeakRateData,
    ownerId: string
  ): Promise<PeakRate> {
    try {
      // Verify room type ownership
      console.log("INI MASUK");
      const roomType = await peakRateRepository.findRoomTypeWithOwnership(
        roomTypeId
      );
      console.log("INI MASUK 2", roomType);
      if (!roomType) {
        throw new Error("Room type not found");
      }

      if (roomType.property.OwnerId !== ownerId) {
        throw new Error(
          "You don't have permission to manage this room's pricing"
        );
      }

      // Parse and validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD format");
      }

      if (startDate >= endDate) {
        throw new Error("Start date must be before end date");
      }

      if (startDate < new Date()) {
        throw new Error("Start date cannot be in the past");
      }

      // Validate rate value
      if (data.value <= 0) {
        throw new Error("Rate value must be greater than 0");
      }

      if (data.rateType === "PERCENTAGE" && data.value > 1000) {
        throw new Error("Percentage rate cannot exceed 1000%");
      }

      // Check for overlapping rates
      const overlappingRates = await peakRateRepository.findOverlappingRates(
        roomTypeId,
        startDate,
        endDate
      );

      if (overlappingRates.length > 0) {
        throw new Error("Peak rate overlaps with existing rate rules");
      }

      console.log("INI MAIH");

      // Create peak rate
      return await peakRateRepository.create({
        roomTypeId: roomTypeId,
        startDate,
        endDate,
        rateType: data.rateType,
        value: data.value,
        description: data.description,
      });
    } catch (error) {
      logger.error("Error adding peak rate:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add peak rate");
    }
  }

  // Update peak rate for specific date
  async updatePeakRateForDate(
    roomTypeId: string,
    dateStr: string,
    data: UpdatePeakRateData,
    ownerId: string
  ): Promise<PeakRate> {
    try {
      // Verify room type ownership
      const roomType = await peakRateRepository.findRoomTypeWithOwnership(
        roomTypeId
      );
      if (!roomType) {
        throw new Error("Room type not found");
      }

      if (roomType.property.OwnerId !== ownerId) {
        throw new Error(
          "You don't have permission to manage this room's pricing"
        );
      }

      // Parse target date
      const targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD format");
      }

      // Find existing peak rate for this date
      const existingRate = await peakRateRepository.findByRoomTypeAndDate(
        roomTypeId,
        targetDate
      );

      if (!existingRate) {
        throw new Error("No peak rate found for the specified date");
      }

      // Validate new dates if provided
      let updateData: {
        startDate?: Date;
        endDate?: Date;
        rateType?: RateType;
        value?: number;
        description?: string;
      } = {};

      if (data.startDate) {
        const newStartDate = new Date(data.startDate);
        if (isNaN(newStartDate.getTime())) {
          throw new Error("Invalid start date format. Use YYYY-MM-DD format");
        }
        updateData.startDate = newStartDate;
      }

      if (data.endDate) {
        const newEndDate = new Date(data.endDate);
        if (isNaN(newEndDate.getTime())) {
          throw new Error("Invalid end date format. Use YYYY-MM-DD format");
        }
        updateData.endDate = newEndDate;
      }

      // Validate date range if both dates are being updated
      const finalStartDate = updateData.startDate || existingRate.startDate;
      const finalEndDate = updateData.endDate || existingRate.endDate;

      if (finalStartDate >= finalEndDate) {
        throw new Error("Start date must be before end date");
      }

      // Validate rate value if provided
      if (data.value !== undefined) {
        if (data.value <= 0) {
          throw new Error("Rate value must be greater than 0");
        }

        const rateType = data.rateType || existingRate.rateType;
        if (rateType === "PERCENTAGE" && data.value > 1000) {
          throw new Error("Percentage rate cannot exceed 1000%");
        }

        updateData.value = data.value;
      }

      if (data.rateType) {
        updateData.rateType = data.rateType;
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      // Check for overlaps if dates are being changed
      if (updateData.startDate || updateData.endDate) {
        const overlappingRates = await peakRateRepository.findOverlappingRates(
          roomTypeId,
          finalStartDate,
          finalEndDate,
          existingRate.id
        );

        if (overlappingRates.length > 0) {
          throw new Error(
            "Updated date range would overlap with existing rate rules"
          );
        }
      }

      return await peakRateRepository.update(existingRate.id, updateData);
    } catch (error) {
      logger.error("Error updating peak rate:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update peak rate");
    }
  }

  // Remove peak rate for specific date
  async removePeakRateForDate(
    roomTypeId: string,
    dateStr: string,
    ownerId: string
  ): Promise<void> {
    try {
      // Verify room type ownership
      const roomType = await peakRateRepository.findRoomTypeWithOwnership(
        roomTypeId
      );
      if (!roomType) {
        throw new Error("Room type not found");
      }

      if (roomType.property.OwnerId !== ownerId) {
        throw new Error(
          "You don't have permission to manage this room's pricing"
        );
      }

      // Parse target date
      const targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD format");
      }

      // Find existing peak rate for this date
      const existingRate = await peakRateRepository.findByRoomTypeAndDate(
        roomTypeId,
        targetDate
      );

      if (!existingRate) {
        throw new Error("No peak rate found for the specified date");
      }

      await peakRateRepository.delete(existingRate.id);
    } catch (error) {
      logger.error("Error removing peak rate:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to remove peak rate");
    }
  }

  // Get all peak rates for a room type
  async getPeakRatesByRoomType(
    roomTypeId: string,
    ownerId: string
  ): Promise<PeakRate[]> {
    try {
      // Verify room type ownership
      const roomType = await peakRateRepository.findRoomTypeWithOwnership(
        roomTypeId
      );
      if (!roomType) {
        throw new Error("Room type not found");
      }

      if (roomType.property.OwnerId !== ownerId) {
        throw new Error(
          "You don't have permission to view this room's pricing"
        );
      }

      return await peakRateRepository.findByRoomType(roomTypeId);
    } catch (error) {
      logger.error("Error getting peak rates:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get peak rates");
    }
  }

  // Get all peak rates for a room type (public access - no ownership check)
  async getPeakRatesByRoomTypePublic(roomTypeId: string): Promise<PeakRate[]> {
    try {
      return await peakRateRepository.findByRoomType(roomTypeId);
    } catch (error) {
      logger.error("Error getting peak rates (public):", error);
      throw new Error("Failed to get peak rates");
    }
  }
}

export default new PeakRateService();
