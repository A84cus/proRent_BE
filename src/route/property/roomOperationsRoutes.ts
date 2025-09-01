import { Router } from "express";
import availabilityRoute from "./availabilityRoute";
import peakRateRoute from "./peakRateRoutes";

const router = Router();

// RoomType-specific operations - availability & pricing
// Routes will be mounted as /api/room-types/...
router.use("/", availabilityRoute);
router.use("/", peakRateRoute);

export default router;
