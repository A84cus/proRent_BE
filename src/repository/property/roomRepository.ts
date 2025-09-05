import { PrismaClient, Room, RoomType, Prisma } from '@prisma/client';
import prisma from '../../prisma';

class RoomRepository {
   // Get all rooms by property ID
   async findAllByProperty (propertyId: string): Promise<Room[]> {
      return prisma.room.findMany({
         where: { propertyId },
         include: {
            roomType: true,
            property: {
               select: {
                  id: true,
                  name: true,
                  OwnerId: true
               }
            },
            gallery: {
               include: {
                  picture: true
               }
            },
            _count: {
               select: {
                  reservations: true,
                  availabilities: true
               }
            }
         },
         orderBy: { createdAt: 'desc' }
      });
   }

   // Find room by ID with full details
   async findById (id: string): Promise<Room | null> {
      return prisma.room.findUnique({
         where: { id },
         include: {
            roomType: true,
            property: {
               include: {
                  Owner: {
                     select: {
                        id: true,
                        email: true
                     }
                  }
               }
            },
            gallery: {
               include: {
                  picture: true
               }
            },
            reservations: {
               where: {
                  orderStatus: {
                     in: [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ]
                  },
                  deletedAt: null
               }
            },
            availabilities: true,
            _count: {
               select: {
                  reservations: true,
                  availabilities: true
               }
            }
         }
      });
   }

   // Find room by ID and check property ownership
   async findByIdAndOwner (id: string, ownerId: string): Promise<Room | null> {
      return prisma.room.findFirst({
         where: {
            id,
            property: {
               OwnerId: ownerId
            }
         },
         include: {
            roomType: true,
            property: true,
            gallery: {
               include: {
                  picture: true
               }
            }
         }
      });
   }

   // Create room (simple room creation)
   async create (roomData: {
      name?: string;
      propertyId: string;
      roomTypeId: string;
      pictures: string[];
   }): Promise<Room> {
      return prisma.$transaction(async tx => {
         // Verify roomType exists and belongs to the property
         const roomType = await tx.roomType.findFirst({
            where: {
               id: roomData.roomTypeId,
               propertyId: roomData.propertyId
            }
         });

         if (!roomType) {
            throw new Error("Room type not found or doesn't belong to this property");
         }

         // Create the room
         const room = await tx.room.create({
            data: {
               name: roomData.name,
               propertyId: roomData.propertyId,
               roomTypeId: roomData.roomTypeId
            },
            include: {
               roomType: true,
               property: true
            }
         });

         // Note: totalQuantity in RoomType represents the maximum capacity
         // and should be set when creating the RoomType, not automatically incremented

         // Add pictures if provided
         if (roomData.pictures && roomData.pictures.length > 0) {
            const roomPictures = roomData.pictures.map(pictureId => ({
               roomId: room.id,
               pictureId
            }));

            await tx.roomPicture.createMany({
               data: roomPictures
            });
         }

         return room;
      });
   }

   // Update room (only room-specific fields)
   async update (
      id: string,
      updateData: {
         name?: string;
         isAvailable?: boolean;
         pictures?: string[];
         roomTypeId?: string;
      }
   ): Promise<Room> {
      return prisma.$transaction(async tx => {
         const room = await tx.room.findUnique({
            where: { id },
            include: { roomType: true }
         });

         if (!room) {
            throw new Error('Room not found');
         }

         // Update room fields
         const updatedRoom = await tx.room.update({
            where: { id },
            data: {
               ...(updateData.name !== undefined && { name: updateData.name }),
               ...(updateData.isAvailable !== undefined && {
                  isAvailable: updateData.isAvailable
               }),
               ...(updateData.roomTypeId !== undefined && {
                  roomTypeId: updateData.roomTypeId
               })
            },
            include: {
               roomType: true,
               property: true,
               gallery: {
                  include: {
                     picture: true
                  }
               }
            }
         });

         // Update pictures if provided
         if (updateData.pictures !== undefined) {
            // Delete existing pictures
            await tx.roomPicture.deleteMany({
               where: { roomId: id }
            });

            // Add new pictures
            if (updateData.pictures.length > 0) {
               const roomPictures = updateData.pictures.map(pictureId => ({
                  roomId: id,
                  pictureId
               }));

               await tx.roomPicture.createMany({
                  data: roomPictures
               });
            }
         }

         return updatedRoom;
      });
   }

   // Verify room type ownership
   async verifyRoomTypeOwnership (roomTypeId: string, propertyId: string, ownerId: string): Promise<boolean> {
      const roomType = await prisma.roomType.findFirst({
         where: {
            id: roomTypeId,
            propertyId,
            property: {
               OwnerId: ownerId
            }
         }
      });
      return !!roomType;
   }

   // Delete room
   async delete (id: string): Promise<void> {
      await prisma.$transaction(async tx => {
         const room = await tx.room.findUnique({
            where: { id },
            include: { roomType: true }
         });

         if (!room) {
            throw new Error('Room not found');
         }

         // Delete room pictures first
         await tx.roomPicture.deleteMany({
            where: { roomId: id }
         });

         // Delete room availabilities
         await tx.availability.deleteMany({
            where: { roomId: id }
         });

         // Delete the room
         await tx.room.delete({
            where: { id }
         });

         // Note: We don't automatically decrease totalQuantity in RoomType
         // because totalQuantity represents the capacity, not actual count

         // If this was the last room of this type, consider deleting the room type
         const remainingRooms = await tx.room.count({
            where: { roomTypeId: room.roomTypeId }
         });

         // Optional: Clean up room type if no rooms remain
         // This is business logic decision - maybe keep room types for future use
         if (remainingRooms === 0) {
            // Delete room type availabilities and peak rates
            await tx.availability.deleteMany({
               where: { roomTypeId: room.roomTypeId }
            });

            await tx.peakRate.deleteMany({
               where: { roomTypeId: room.roomTypeId }
            });

            // Note: We don't auto-delete room type here
            // That should be a separate business decision
         }
      });
   }

   // Check if room has active bookings
   async hasActiveBookings (roomId: string): Promise<boolean> {
      const activeBookingCount = await prisma.reservation.count({
         where: {
            roomId,
            orderStatus: {
               in: [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ]
            },
            deletedAt: null
         }
      });
      return activeBookingCount > 0;
   }

   // Verify property ownership
   async verifyPropertyOwnership (propertyId: string, ownerId: string): Promise<boolean> {
      const property = await prisma.property.findFirst({
         where: {
            id: propertyId,
            OwnerId: ownerId
         }
      });
      return !!property;
   }
}

export default new RoomRepository();
