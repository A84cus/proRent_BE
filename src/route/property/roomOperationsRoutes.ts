import { Router } from "express";
import availabilityRoute from "./availabilityRoute";
import peakRateRoute from "./peakRateRoutes";

const router = Router();

// Room-specific operations - availability & pricing
router.use("/availability", availabilityRoute);
router.use("/peak-rates", peakRateRoute);

export default router;
