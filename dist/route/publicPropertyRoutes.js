"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const publicPropertyController_1 = __importDefault(require("../controller/publicPropertyController"));
const router = express_1.default.Router();
// GET /api/public/properties - Public property search
router.get("/", publicPropertyController_1.default.searchProperties);
// GET /api/public/properties/:id - Get property details
router.get("/:id", publicPropertyController_1.default.getPropertyDetails);
// GET /api/public/properties/:id/calendar-pricing - Get calendar with pricing
router.get("/:id/calendar-pricing", publicPropertyController_1.default.getPropertyCalendarPricing);
// GET /api/public/properties/:id/rooms - Get property rooms
router.get("/:id/rooms", publicPropertyController_1.default.getPropertyRooms);
exports.default = router;
