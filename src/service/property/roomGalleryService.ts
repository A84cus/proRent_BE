import prisma from "../../prisma";
import logger from "../../utils/system/logger";

class RoomGalleryService {
  // Verify room ownership through property ownership
  async verifyRoomOwnership(roomId: string, ownerId: string): Promise<boolean> {
    try {
      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
          property: {
            OwnerId: ownerId,
          },
        },
      });
      return !!room;
    } catch (error) {
      logger.error("Error verifying room ownership:", error);
      throw error;
    }
  }

  // Add picture to room gallery
  async addToGallery(roomId: string, pictureId: string) {
    try {
      // Check if picture exists
      const picture = await prisma.picture.findUnique({
        where: { id: pictureId },
      });

      if (!picture) {
        throw new Error("Picture not found");
      }

      // Check if already in gallery
      const existing = await prisma.roomPicture.findUnique({
        where: {
          roomId_pictureId: {
            roomId,
            pictureId,
          },
        },
      });

      if (existing) {
        throw new Error("Picture already in gallery");
      }

      // Add to gallery
      const result = await prisma.roomPicture.create({
        data: {
          roomId,
          pictureId,
        },
        include: {
          picture: true,
        },
      });

      logger.info(`Picture ${pictureId} added to room ${roomId} gallery`);
      return result;
    } catch (error) {
      logger.error("Error adding picture to room gallery:", error);
      throw error;
    }
  }

  // Remove picture from room gallery
  async removeFromGallery(roomId: string, pictureId: string): Promise<void> {
    try {
      const deleted = await prisma.roomPicture.delete({
        where: {
          roomId_pictureId: {
            roomId,
            pictureId,
          },
        },
      });

      logger.info(`Picture ${pictureId} removed from room ${roomId} gallery`);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new Error("Picture not found in gallery");
      }
      logger.error("Error removing picture from room gallery:", error);
      throw error;
    }
  }

  // Get room gallery
  async getRoomGallery(roomId: string) {
    try {
      const gallery = await prisma.roomPicture.findMany({
        where: { roomId },
        include: {
          picture: true,
        },
        orderBy: {
          picture: {
            createdAt: "asc",
          },
        },
      });

      return gallery;
    } catch (error) {
      logger.error("Error getting room gallery:", error);
      throw error;
    }
  }
}

export default new RoomGalleryService();
