"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const peakRateController_1 = __importDefault(require("../controller/peakRateController"));
const authMwr_1 = require("../middleware/authMwr");
const router = express_1.default.Router();
// POST /api/rooms/:id/peak-price - Add peak rate rule
router.post("/:id/peak-price", authMwr_1.authOwner, peakRateController_1.default.addPeakRate);
// PATCH /api/rooms/:id/peak-price/:date - Update peak rate for specific date
router.patch("/:id/peak-price/:date", authMwr_1.authOwner, peakRateController_1.default.updatePeakRateForDate);
// DELETE /api/rooms/:id/peak-price/:date - Remove peak rate for specific date
router.delete("/:id/peak-price/:date", authMwr_1.authOwner, peakRateController_1.default.removePeakRateForDate);
exports.default = router;
