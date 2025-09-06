import { Request, Response } from "express";
import BaseController from "../BaseController";
import ResponseHelper from "../../helpers/system/responseHelper";
import peakRateService from "../../service/property/peakRateService";
import publicPropertyService from "../../service/property/publicPropertyService";
import {
  PROPERTY_ERROR_MESSAGES,
  PROPERTY_SUCCESS_MESSAGES,
} from "../../constants/controllers/property";
import moment from "moment";

class RoomTypePricingController extends BaseController {
  /**
   * GET /api/rooms/:id/pricing/map - Get price map for calendar display
   */
  async getPriceMap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { year, month } = req.query;

      if (!id) {
        ResponseHelper.error(
          res,
          PROPERTY_ERROR_MESSAGES.ROOM_TYPE_ID_REQUIRED,
          undefined,
          400
        );
        return;
      }

      // Validate year and month
      const numYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();
      const numMonth = month
        ? parseInt(month as string)
        : new Date().getMonth() + 1;

      if (isNaN(numYear) || isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
        ResponseHelper.error(
          res,
          "Invalid year or month parameter",
          undefined,
          400
        );
        return;
      }

      // Get the first and last day of the month
      const startDate = moment(
        `${numYear}-${numMonth}-01`,
        "Asia/Jakarta"
      ).startOf("day");
      const endDate = startDate.clone().endOf("month");

      const priceMap = await this.calculatePriceMapForDateRange(
        id,
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );

      ResponseHelper.success(res, "Price map retrieved successfully", priceMap);
    } catch (error) {
      console.error("Error getting price map:", error);
      ResponseHelper.error(res, "Failed to get price map", undefined, 500);
    }
  }

  /**
   * GET /api/rooms/:id/pricing/detailed - Get detailed pricing information
   */
  async getDetailedPricing(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!id || !startDate || !endDate) {
        ResponseHelper.error(
          res,
          "Room type ID, start date, and end date are required",
          undefined,
          400
        );
        return;
      }

      const detailedPricing = await this.calculateDetailedPricing(
        id,
        startDate as string,
        endDate as string
      );

      ResponseHelper.success(
        res,
        "Detailed pricing retrieved successfully",
        detailedPricing
      );
    } catch (error) {
      console.error("Error getting detailed pricing:", error);
      ResponseHelper.error(
        res,
        "Failed to get detailed pricing",
        undefined,
        500
      );
    }
  }

  /**
   * GET /api/rooms/:id/pricing/calculate - Calculate total price for date range
   */
  async calculateTotalPrice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!id || !startDate || !endDate) {
        ResponseHelper.error(
          res,
          "Room type ID, start date, and end date are required",
          undefined,
          400
        );
        return;
      }

      const detailedPricing = await this.calculateDetailedPricing(
        id,
        startDate as string,
        endDate as string
      );

      const totalPrice = detailedPricing.reduce(
        (sum, dayPrice) => sum + dayPrice.finalPrice,
        0
      );
      const numberOfNights = detailedPricing.length;

      ResponseHelper.success(res, "Total price calculated successfully", {
        totalPrice,
        nightlyBreakdown: detailedPricing,
        numberOfNights,
      });
    } catch (error) {
      console.error("Error calculating total price:", error);
      ResponseHelper.error(
        res,
        "Failed to calculate total price",
        undefined,
        500
      );
    }
  }

  /**
   * Helper method to calculate price map for date range
   */
  private async calculatePriceMapForDateRange(
    roomTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    const priceMap: Record<string, number> = {};

    try {
      // Get room type base price
      const roomType = await publicPropertyService.getRoomTypeById(roomTypeId);
      if (!roomType) {
        throw new Error("Room type not found");
      }

      const basePrice = parseFloat(roomType.basePrice);

      // Get all peak rates for this room type
      const peakRates = await peakRateService.getPeakRatesByRoomTypePublic(
        roomTypeId
      );

      // Generate dates and calculate prices
      const start = moment(startDate, "Asia/Jakarta");
      const end = moment(endDate, "Asia/Jakarta");

      for (
        let date = start.clone();
        date.isSameOrBefore(end);
        date.add(1, "day")
      ) {
        const dateStr = date.format("YYYY-MM-DD");

        // Check if this date has a peak rate
        const applicablePeakRate = peakRates.find((peakRate) => {
          const peakStart = moment(peakRate.startDate);
          const peakEnd = moment(peakRate.endDate);
          return (
            date.isSameOrAfter(peakStart, "day") &&
            date.isSameOrBefore(peakEnd, "day")
          );
        });

        if (applicablePeakRate) {
          // Calculate price with peak rate
          if (applicablePeakRate.rateType === "FIXED") {
            priceMap[dateStr] = parseFloat(applicablePeakRate.value.toString());
          } else {
            // PERCENTAGE
            priceMap[dateStr] =
              basePrice +
              (basePrice * parseFloat(applicablePeakRate.value.toString())) /
                100;
          }
        } else {
          // Use base price
          priceMap[dateStr] = basePrice;
        }
      }

      return priceMap;
    } catch (error) {
      console.error("Error calculating price map:", error);
      throw error;
    }
  }

  /**
   * Helper method to calculate detailed pricing
   */
  private async calculateDetailedPricing(
    roomTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      date: string;
      basePrice: number;
      finalPrice: number;
      hasPeakRate: boolean;
      peakRate?: any;
    }>
  > {
    const pricingDetails: Array<{
      date: string;
      basePrice: number;
      finalPrice: number;
      hasPeakRate: boolean;
      peakRate?: any;
    }> = [];

    try {
      // Get room type base price
      const roomType = await publicPropertyService.getRoomTypeById(roomTypeId);
      if (!roomType) {
        throw new Error("Room type not found");
      }

      const basePrice = parseFloat(roomType.basePrice);

      // Get all peak rates for this room type
      const peakRates = await peakRateService.getPeakRatesByRoomTypePublic(
        roomTypeId
      );

      // Generate dates and calculate prices
      const start = moment(startDate, "Asia/Jakarta");
      const end = moment(endDate, "Asia/Jakarta");

      for (let date = start.clone(); date.isBefore(end); date.add(1, "day")) {
        const dateStr = date.format("YYYY-MM-DD");

        // Check if this date has a peak rate
        const applicablePeakRate = peakRates.find((peakRate) => {
          const peakStart = moment(peakRate.startDate);
          const peakEnd = moment(peakRate.endDate);
          return (
            date.isSameOrAfter(peakStart, "day") &&
            date.isSameOrBefore(peakEnd, "day")
          );
        });

        let finalPrice = basePrice;
        let hasPeakRate = false;
        let peakRateData = undefined;

        if (applicablePeakRate) {
          hasPeakRate = true;
          peakRateData = applicablePeakRate;

          if (applicablePeakRate.rateType === "FIXED") {
            finalPrice = parseFloat(applicablePeakRate.value.toString());
          } else {
            // PERCENTAGE
            finalPrice =
              basePrice +
              (basePrice * parseFloat(applicablePeakRate.value.toString())) /
                100;
          }
        }

        pricingDetails.push({
          date: dateStr,
          basePrice,
          finalPrice,
          hasPeakRate,
          peakRate: peakRateData,
        });
      }

      return pricingDetails;
    } catch (error) {
      console.error("Error calculating detailed pricing:", error);
      throw error;
    }
  }
}

export default new RoomTypePricingController();
