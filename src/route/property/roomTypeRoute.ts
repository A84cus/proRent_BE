import { Router } from "express";
import {
  createRoomType,
  getRoomTypesByProperty,
  updateRoomType,
  deleteRoomType,
} from "../../controller/property/roomTypeController";
import { authOwner } from "../../middleware/auth";

const router = Router();

// POST /api/owner/room-types
router.post("/", authOwner, createRoomType);
// GET room types by property
router.get("/", authOwner, getRoomTypesByProperty);
// PUT update room type
router.put("/:id", authOwner, updateRoomType);
// DELETE room type
router.delete("/:id", authOwner, deleteRoomType);

export default router;
