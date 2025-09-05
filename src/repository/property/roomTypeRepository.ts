import { PrismaClient, RoomType, Prisma } from '@prisma/client';
import prisma from '../../prisma';

class RoomTypeRepository {
   // Get all room types by property ID
   async findAllByProperty (propertyId: string): Promise<RoomType[]> {
      return prisma.roomType.findMany({
         where: { propertyId },
         include: {
            property: {
               select: {
                  id: true,
                  name: true,
                  OwnerId: true
               }
            },
            rooms: {
               include: {
                  gallery: {
                     include: {
                        picture: true
                     }
                  }
               }
            },
            availabilities: true,
            peakRates: true,
            _count: {
               select: {
                  rooms: true,
                  reservations: true,
                  availabilities: true
               }
            }
         },
         orderBy: { createdAt: 'desc' }
      });
   }

   // Find room type by ID with full details
   async findById (id: string): Promise<RoomType | null> {
      return prisma.roomType.findUnique({
         where: { id },
         include: {
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
            rooms: {
               include: {
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
                  }
               }
            },
            availabilities: true,
            peakRates: true,
            reservations: {
               where: {
                  orderStatus: {
                     in: [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ]
                  },
                  deletedAt: null
               }
            },
            _count: {
               select: {
                  rooms: true,
                  reservations: true,
                  availabilities: true
               }
            }
         }
      });
   }

   // Find room type by ID and check property ownership
   async findByIdAndOwner (id: string, ownerId: string): Promise<RoomType | null> {
      return prisma.roomType.findFirst({
         where: {
            id,
            property: {
               OwnerId: ownerId
            }
         },
         include: {
            property: true,
            rooms: {
               include: {
                  gallery: {
                     include: {
                        picture: true
                     }
                  }
               }
            },
            availabilities: true,
            peakRates: true,
            _count: {
               select: {
                  rooms: true
               }
            }
         }
      });
   }

   // Find room type by name and property
   async findByNameAndProperty (name: string, propertyId: string): Promise<RoomType | null> {
      return prisma.roomType.findFirst({
         where: {
            name,
            propertyId
         }
      });
   }

   // Create room type
   async create (roomTypeData: {
      propertyId: string;
      name: string;
      description?: string;
      basePrice: number;
      capacity: number;
      totalQuantity: number;
      isWholeUnit: boolean;
   }): Promise<RoomType> {
      return prisma.roomType.create({
         data: roomTypeData,
         include: {
            property: true,
            rooms: true,
            _count: {
               select: {
                  rooms: true
               }
            }
         }
      });
   }

   // Update room type
   async update (
      id: string,
      updateData: {
         name?: string;
         description?: string;
         basePrice?: number;
         capacity?: number;
         totalQuantity?: number;
      }
   ): Promise<RoomType> {
      return prisma.roomType.update({
         where: { id },
         data: updateData,
         include: {
            property: true,
            rooms: {
               include: {
                  gallery: {
                     include: {
                        picture: true
                     }
                  }
               }
            },
            availabilities: true,
            peakRates: true,
            _count: {
               select: {
                  rooms: true
               }
            }
         }
      });
   }

   // Delete room type
   async delete (id: string): Promise<void> {
      await prisma.$transaction(async tx => {
         // Delete related data first
         await tx.availability.deleteMany({
            where: { roomTypeId: id }
         });

         await tx.peakRate.deleteMany({
            where: { roomTypeId: id }
         });

         // Delete the room type
         await tx.roomType.delete({
            where: { id }
         });
      });
   }

   // Check if room type has assigned rooms
   async hasAssignedRooms (roomTypeId: string): Promise<boolean> {
      const roomCount = await prisma.room.count({
         where: { roomTypeId }
      });
      return roomCount > 0;
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

export default new RoomTypeRepository();
