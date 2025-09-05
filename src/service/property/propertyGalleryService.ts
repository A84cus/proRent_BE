import prisma from "../../prisma";
import logger from "../../utils/system/logger";

class PropertyGalleryService {
  // Verify property ownership
  async verifyPropertyOwnership(
    propertyId: string,
    ownerId: string
  ): Promise<boolean> {
    try {
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          OwnerId: ownerId,
        },
      });
      return !!property;
    } catch (error) {
      logger.error("Error verifying property ownership:", error);
      throw error;
    }
  }

  // Add picture to property gallery
  async addToGallery(propertyId: string, pictureId: string) {
    try {
      // Check if picture exists
      const picture = await prisma.picture.findUnique({
        where: { id: pictureId },
      });

      if (!picture) {
        throw new Error("Picture not found");
      }

      // Check if already in gallery
      const existing = await prisma.propertyPicture.findUnique({
        where: {
          propertyId_pictureId: {
            propertyId,
            pictureId,
          },
        },
      });

      if (existing) {
        throw new Error("Picture already in gallery");
      }

      // Add to gallery
      const result = await prisma.propertyPicture.create({
        data: {
          propertyId,
          pictureId,
        },
        include: {
          picture: true,
        },
      });

      logger.info(
        `Picture ${pictureId} added to property ${propertyId} gallery`
      );
      return result;
    } catch (error) {
      logger.error("Error adding picture to gallery:", error);
      throw error;
    }
  }

  // Remove picture from property gallery
  async removeFromGallery(
    propertyId: string,
    pictureId: string
  ): Promise<void> {
    try {
      const deleted = await prisma.propertyPicture.delete({
        where: {
          propertyId_pictureId: {
            propertyId,
            pictureId,
          },
        },
      });

      logger.info(
        `Picture ${pictureId} removed from property ${propertyId} gallery`
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new Error("Picture not found in gallery");
      }
      logger.error("Error removing picture from gallery:", error);
      throw error;
    }
  }

  // Get property gallery
  async getGallery(propertyId: string) {
    try {
      const gallery = await prisma.propertyPicture.findMany({
        where: { propertyId },
        include: {
          picture: true,
        },
        orderBy: {
          picture: {
            uploadedAt: "desc",
          },
        },
      });

      return gallery.map((item) => item.picture);
    } catch (error) {
      logger.error("Error fetching property gallery:", error);
      throw error;
    }
  }

  // Set main picture for property
  async setMainPicture(propertyId: string, pictureId: string) {
    try {
      // Check if picture exists and is in property gallery
      const galleryItem = await prisma.propertyPicture.findUnique({
        where: {
          propertyId_pictureId: {
            propertyId,
            pictureId,
          },
        },
        include: {
          picture: true,
        },
      });

      if (!galleryItem) {
        throw new Error("Picture not found in property gallery");
      }

      // Update property main picture
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: { mainPictureId: pictureId },
        include: {
          mainPicture: true,
        },
      });

      logger.info(`Main picture set for property ${propertyId}: ${pictureId}`);
      return updatedProperty;
    } catch (error) {
      logger.error("Error setting main picture:", error);
      throw error;
    }
  }
}

export default new PropertyGalleryService();
