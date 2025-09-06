"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = __importDefault(require("../../controller/property/availabilityController"));
const authMwr_1 = require("../../middleware/auth/authMwr");
const controller_1 = require("../../controller");
const router = (0, express_1.Router)();
// POST /api/rooms/:id/availability - Bulk set availability for room/room-type
router.post("/:id/availability", authMwr_1.authOwner, availabilityController_1.default.setBulkAvailability.bind(availabilityController_1.default));
// GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability for room/room-type (Owner access)
router.get("/:id/availability", authMwr_1.authOwner, availabilityController_1.default.getMonthlyAvailability.bind(availabilityController_1.default));
// GET /api/rooms/:id/peak-rates - Get all peak rates for room type
router.get("/:id/peak-rates", authMwr_1.authOwner, controller_1.peakRateController.getPeakRates);
// POST /api/rooms/:id/peak-price - Add peak rate rule for room/room-type
router.post("/:id/peak-price", authMwr_1.authOwner, controller_1.peakRateController.addPeakRate);
// PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
router.patch("/:id/peak-price/:date", authMwr_1.authOwner, controller_1.peakRateController.updatePeakRateForDate);
// DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
router.delete("/:id/peak-price/:date", authMwr_1.authOwner, controller_1.peakRateController.removePeakRateForDate);
exports.default = router;
