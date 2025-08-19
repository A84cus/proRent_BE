import { PrismaClient, Room, RoomType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class RoomRepository {
  // Get all rooms by property ID
  async findAllByProperty(propertyId: string): Promise<Room[]> {
    return prisma.room.findMany({
      where: { propertyId },
      include: {
        roomType: true,
        property: {
          select: {
            id: true,
            name: true,
            OwnerId: true,
          },
        },
        gallery: {
          include: {
            picture: true,
          },
        },
        _count: {
          select: {
            reservations: true,
            availabilities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Find room by ID with full details
  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        property: {
          include: {
            Owner: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        gallery: {
          include: {
            picture: true,
          },
        },
        reservations: {
          where: {
            orderStatus: {
              in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
            },
            deletedAt: null,
          },
        },
        availabilities: true,
        _count: {
          select: {
            reservations: true,
            availabilities: true,
          },
        },
      },
    });
  }

  // Find room by ID and check property ownership
  async findByIdAndOwner(id: string, ownerId: string): Promise<Room | null> {
    return prisma.room.findFirst({
      where: {
        id,
        property: {
          OwnerId: ownerId,
        },
      },
      include: {
        roomType: true,
        property: true,
        gallery: {
          include: {
            picture: true,
          },
        },
      },
    });
  }

  // Create room with room type
  async createWithRoomType(roomData: {
    name: string;
    propertyId: string;
    roomTypeName: string;
    description?: string;
    basePrice: number;
    capacity: number;
    pictures: string[];
  }): Promise<Room> {
    return prisma.$transaction(async (tx) => {
      // First, create or get the room type
      let roomType = await tx.roomType.findFirst({
        where: {
          propertyId: roomData.propertyId,
          name: roomData.roomTypeName,
        },
      });

      if (!roomType) {
        roomType = await tx.roomType.create({
          data: {
            propertyId: roomData.propertyId,
            name: roomData.roomTypeName,
            description: roomData.description,
            basePrice: roomData.basePrice,
            capacity: roomData.capacity,
            totalQuantity: 1,
            isWholeUnit: false,
          },
        });
      } else {
        // Just increment quantity, don't override other properties
        roomType = await tx.roomType.update({
          where: { id: roomType.id },
          data: {
            totalQuantity: roomType.totalQuantity + 1,
          },
        });
      }

      // Create the room
      const room = await tx.room.create({
        data: {
          name: roomData.name,
          propertyId: roomData.propertyId,
          roomTypeId: roomType.id,
        },
        include: {
          roomType: true,
          property: true,
        },
      });

      // Add pictures if provided
      if (roomData.pictures && roomData.pictures.length > 0) {
        const roomPictures = roomData.pictures.map((pictureId) => ({
          roomId: room.id,
          pictureId: pictureId,
        }));

        await tx.roomPicture.createMany({
          data: roomPictures,
        });
      }

      return room;
    });
  }

  // Update room and room type
  async updateRoomAndType(
    id: string,
    updateData: {
      name?: string;
      description?: string;
      basePrice?: number;
      capacity?: number;
      pictures?: string[];
    }
  ): Promise<Room> {
    return prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id },
        include: { roomType: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Update room name if provided
      if (updateData.name) {
        await tx.room.update({
          where: { id },
          data: { name: updateData.name },
        });
      }

      // Update room type if price, capacity, or description provided
      if (
        updateData.basePrice !== undefined ||
        updateData.capacity !== undefined ||
        updateData.description !== undefined
      ) {
        await tx.roomType.update({
          where: { id: room.roomTypeId },
          data: {
            ...(updateData.description !== undefined && {
              description: updateData.description,
            }),
            ...(updateData.basePrice !== undefined && {
              basePrice: updateData.basePrice,
            }),
            ...(updateData.capacity !== undefined && {
              capacity: updateData.capacity,
            }),
          },
        });
      }

      // Update pictures if provided
      if (updateData.pictures) {
        // Delete existing pictures
        await tx.roomPicture.deleteMany({
          where: { roomId: id },
        });

        // Add new pictures
        if (updateData.pictures.length > 0) {
          const roomPictures = updateData.pictures.map((pictureId) => ({
            roomId: id,
            pictureId: pictureId,
          }));

          await tx.roomPicture.createMany({
            data: roomPictures,
          });
        }
      }

      // Return updated room with includes
      return tx.room.findUnique({
        where: { id },
        include: {
          roomType: true,
          property: true,
          gallery: {
            include: {
              picture: true,
            },
          },
        },
      }) as Promise<Room>;
    });
  }

  // Delete room
  async delete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id },
        include: { roomType: true },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      // Delete room pictures first
      await tx.roomPicture.deleteMany({
        where: { roomId: id },
      });

      // Delete room availabilities
      await tx.availability.deleteMany({
        where: { roomId: id },
      });

      // Delete the room
      await tx.room.delete({
        where: { id },
      });

      // Update room type quantity
      await tx.roomType.update({
        where: { id: room.roomTypeId },
        data: {
          totalQuantity: Math.max(0, room.roomType.totalQuantity - 1),
        },
      });

      // If this was the last room of this type, consider deleting the room type
      const remainingRooms = await tx.room.count({
        where: { roomTypeId: room.roomTypeId },
      });

      if (remainingRooms === 0) {
        // Delete room type availabilities and peak rates
        await tx.availability.deleteMany({
          where: { roomTypeId: room.roomTypeId },
        });

        await tx.peakRate.deleteMany({
          where: { roomTypeId: room.roomTypeId },
        });

        // Delete the room type
        await tx.roomType.delete({
          where: { id: room.roomTypeId },
        });
      }
    });
  }

  // Check if room has active bookings
  async hasActiveBookings(roomId: string): Promise<boolean> {
    const activeBookingCount = await prisma.reservation.count({
      where: {
        roomId,
        orderStatus: {
          in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
        },
        deletedAt: null,
      },
    });
    return activeBookingCount > 0;
  }

  // Verify property ownership
  async verifyPropertyOwnership(
    propertyId: string,
    ownerId: string
  ): Promise<boolean> {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OwnerId: ownerId,
      },
    });
    return !!property;
  }
}

export default new RoomRepository();
