"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomTypeController_1 = require("../../controller/property/roomTypeController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/owner/room-types
router.post("/", auth_1.authOwner, roomTypeController_1.createRoomType);
// GET room types by property
router.get("/", auth_1.authOwner, roomTypeController_1.getRoomTypesByProperty);
// PUT update room type
router.put("/:id", auth_1.authOwner, roomTypeController_1.updateRoomType);
// DELETE room type
router.delete("/:id", auth_1.authOwner, roomTypeController_1.deleteRoomType);
exports.default = router;
