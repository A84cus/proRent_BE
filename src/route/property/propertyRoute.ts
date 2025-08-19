import { Router } from "express";
import propertyController from "../../controller/property/propertyController";
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

export default router;
