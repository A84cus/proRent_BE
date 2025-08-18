"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomController_1 = __importDefault(require("../controller/roomController"));
const authMwr_1 = require("../middleware/authMwr");
const router = (0, express_1.Router)();
// GET /api/owner/rooms?propertyId= - Get all rooms by property
router.get("/", authMwr_1.authOwner, roomController_1.default.getRoomsByProperty.bind(roomController_1.default));
// POST /api/owner/rooms - Create new room
router.post("/", authMwr_1.authOwner, roomController_1.default.createRoom.bind(roomController_1.default));
// PATCH /api/owner/rooms/:id - Update room
router.patch("/:id", authMwr_1.authOwner, roomController_1.default.updateRoom.bind(roomController_1.default));
// DELETE /api/owner/rooms/:id - Delete room
router.delete("/:id", authMwr_1.authOwner, roomController_1.default.deleteRoom.bind(roomController_1.default));
exports.default = router;
