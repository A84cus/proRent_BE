import { Router } from "express";
import roomController from "../../controller/property/roomController";
import roomGalleryController from "../../controller/property/roomGalleryController";
import { authOwner } from "../../middleware/auth/authMwr";

const router = Router();

// GET /api/owner/rooms?propertyId= - Get all rooms by property
router.get(
  "/",
  authOwner,
  roomController.getRoomsByProperty.bind(roomController)
);

// POST /api/owner/rooms - Create new room
router.post("/", authOwner, roomController.createRoom.bind(roomController));

// PATCH /api/owner/rooms/:id - Update room
router.patch("/:id", authOwner, roomController.updateRoom.bind(roomController));

// DELETE /api/owner/rooms/:id - Delete room
router.delete(
  "/:id",
  authOwner,
  roomController.deleteRoom.bind(roomController)
);

// POST /api/owner/rooms/:roomId/gallery - Add image to room gallery
router.post(
  "/:roomId/gallery",
  authOwner,
  roomGalleryController.addToGallery.bind(roomGalleryController)
);

// DELETE /api/owner/rooms/:roomId/gallery/:pictureId - Remove image from room gallery
router.delete(
  "/:roomId/gallery/:pictureId",
  authOwner,
  roomGalleryController.removeFromGallery.bind(roomGalleryController)
);

export default router;
