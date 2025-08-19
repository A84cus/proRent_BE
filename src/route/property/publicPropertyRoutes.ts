import express from "express";
import publicPropertyController from "../../controller/property/publicPropertyController";

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

export default router;
