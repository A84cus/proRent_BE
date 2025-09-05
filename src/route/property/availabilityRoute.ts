import { Router } from "express";
import availabilityController from "../../controller/property/availabilityController";
import { authOwner } from "../../middleware/auth/authMwr";

const router = Router();

// POST /api/rooms/:id/availability - Bulk set availability for room/room-type
router.post(
  "/:id/availability",
  authOwner,
  availabilityController.setBulkAvailability.bind(availabilityController)
);

// GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability for room/room-type
router.get(
  "/:id/availability",
  authOwner,
  availabilityController.getMonthlyAvailability.bind(availabilityController)
);

export default router;
