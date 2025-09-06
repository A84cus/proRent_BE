import { Router } from "express";
import availabilityController from "../../controller/property/availabilityController";
import { authOwner } from "../../middleware/auth/authMwr";
import { peakRateController } from "../../controller";

const router = Router();

// POST /api/rooms/:id/availability - Bulk set availability for room/room-type
router.post(
  "/:id/availability",
  authOwner,
  availabilityController.setBulkAvailability.bind(availabilityController)
);

// GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability for room/room-type (Owner access)
router.get(
  "/:id/availability",
  authOwner,
  availabilityController.getMonthlyAvailability.bind(availabilityController)
);

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
