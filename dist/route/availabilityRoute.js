"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = __importDefault(require("../controller/availabilityController"));
const authMwr_1 = require("../middleware/authMwr");
const router = (0, express_1.Router)();
// POST /api/rooms/:id/availability - Bulk set availability
router.post("/:id/availability", authMwr_1.authOwner, availabilityController_1.default.setBulkAvailability.bind(availabilityController_1.default));
// GET /api/rooms/:id/availability?month=YYYY-MM - Get monthly availability
router.get("/:id/availability", authMwr_1.authOwner, availabilityController_1.default.getMonthlyAvailability.bind(availabilityController_1.default));
exports.default = router;
