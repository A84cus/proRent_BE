"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = __importDefault(require("../../controller/property/propertyController"));
const propertyGalleryController_1 = __importDefault(require("../../controller/property/propertyGalleryController"));
const authMwr_1 = require("../../middleware/auth/authMwr");
const router = (0, express_1.Router)();
// GET /api/owner/properties - List all properties owned by owner
router.get("/", authMwr_1.authOwner, propertyController_1.default.getAllProperties.bind(propertyController_1.default));
// POST /api/owner/properties - Create new property
router.post("/", authMwr_1.authOwner, propertyController_1.default.createProperty.bind(propertyController_1.default));
// GET /api/owner/properties/:id - Get property details
router.get("/:id", authMwr_1.authOwner, propertyController_1.default.getPropertyById.bind(propertyController_1.default));
// PATCH /api/owner/properties/:id - Update property
router.patch("/:id", authMwr_1.authOwner, propertyController_1.default.updateProperty.bind(propertyController_1.default));
// DELETE /api/owner/properties/:id - Delete property
router.delete("/:id", authMwr_1.authOwner, propertyController_1.default.deleteProperty.bind(propertyController_1.default));
// POST /api/owner/properties/:propertyId/gallery - Add image to property gallery
router.post("/:propertyId/gallery", authMwr_1.authOwner, propertyGalleryController_1.default.addToGallery.bind(propertyGalleryController_1.default));
// DELETE /api/owner/properties/:propertyId/gallery/:pictureId - Remove image from gallery
router.delete("/:propertyId/gallery/:pictureId", authMwr_1.authOwner, propertyGalleryController_1.default.removeFromGallery.bind(propertyGalleryController_1.default));
// PATCH /api/owner/properties/:propertyId/gallery/:pictureId/set-main - Set image as main picture
router.patch("/:propertyId/gallery/:pictureId/set-main", authMwr_1.authOwner, propertyGalleryController_1.default.setMainPicture.bind(propertyGalleryController_1.default));
exports.default = router;
