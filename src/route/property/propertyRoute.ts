import { Router } from "express";
import propertyController from "../../controller/property/propertyController";
import propertyGalleryController from "../../controller/property/propertyGalleryController";
import { authOwner } from "../../middleware/auth/authMwr";

const router = Router();

// GET /api/owner/properties - List all properties owned by owner
router.get(
  "/",
  authOwner,
  propertyController.getAllProperties.bind(propertyController)
);

// POST /api/owner/properties - Create new property
router.post(
  "/",
  authOwner,
  propertyController.createProperty.bind(propertyController)
);

// GET /api/owner/properties/:id - Get property details
router.get(
  "/:id",
  authOwner,
  propertyController.getPropertyById.bind(propertyController)
);

// PATCH /api/owner/properties/:id - Update property
router.patch(
  "/:id",
  authOwner,
  propertyController.updateProperty.bind(propertyController)
);

// DELETE /api/owner/properties/:id - Delete property
router.delete(
  "/:id",
  authOwner,
  propertyController.deleteProperty.bind(propertyController)
);

// POST /api/owner/properties/:propertyId/gallery - Add image to property gallery
router.post(
  "/:propertyId/gallery",
  authOwner,
  propertyGalleryController.addToGallery.bind(propertyGalleryController)
);

// DELETE /api/owner/properties/:propertyId/gallery/:pictureId - Remove image from gallery
router.delete(
  "/:propertyId/gallery/:pictureId",
  authOwner,
  propertyGalleryController.removeFromGallery.bind(propertyGalleryController)
);

// PATCH /api/owner/properties/:propertyId/gallery/:pictureId/set-main - Set image as main picture
router.patch(
  "/:propertyId/gallery/:pictureId/set-main",
  authOwner,
  propertyGalleryController.setMainPicture.bind(propertyGalleryController)
);

export default router;
