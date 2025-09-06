import express from "express";
import publicPropertyController from "../../controller/property/publicPropertyController";
import availabilityController from "../../controller/property/availabilityController";

const router = express.Router();

// GET /api/public/properties - Public property search
router.get("/", publicPropertyController.searchProperties);

// GET /api/public/properties/:id - Get property details
router.get("/:id", publicPropertyController.getPropertyDetails);

// GET /api/public/properties/:id/calendar-pricing - Get calendar with pricing
router.get(
  "/:id/calendar-pricing",
  publicPropertyController.getPropertyCalendarPricing
);

// GET /api/public/properties/:id/rooms - Get property rooms
router.get("/:id/rooms", publicPropertyController.getPropertyRooms);

// GET /api/public/properties/rooms/:roomId/availability - Public access to room availability
router.get(
  "/rooms/:roomId/availability",
  availabilityController.getMonthlyAvailability.bind(availabilityController)
);

export default router;
