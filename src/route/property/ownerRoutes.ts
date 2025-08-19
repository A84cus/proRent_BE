import { Router } from "express";
import categoryRoute from "./categoryRoute";
import propertyRoute from "./propertyRoute";
import roomRoute from "./roomRoute";

const router = Router();

// Owner management routes - semua sudah include auth middleware di masing-masing route
router.use("/categories", categoryRoute);
router.use("/properties", propertyRoute);
router.use("/rooms", roomRoute);

export default router;
