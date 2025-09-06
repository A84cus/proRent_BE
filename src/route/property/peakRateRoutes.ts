import express from "express";
import peakRateController from "../../controller/property/peakRateController";
import { authOwner } from "../../middleware/auth/authMwr";

const router = express.Router();

// GET /api/rooms/:id/peak-rates - Get all peak rates for room type
router.get("/:id/peak-rates", authOwner, peakRateController.getPeakRates);

// POST /api/rooms/:id/peak-price - Add peak rate rule for room/room-type
router.post("/:id/peak-price", authOwner, peakRateController.addPeakRate);

// PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
router.patch(
  "/:id/peak-price/:date",
  authOwner,
  peakRateController.updatePeakRateForDate
);

// DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
router.delete(
  "/:id/peak-price/:date",
  authOwner,
  peakRateController.removePeakRateForDate
);

export default router;
