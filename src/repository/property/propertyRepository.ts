import { PrismaClient, Property, Prisma } from '@prisma/client';
import prisma from '../../prisma';

class PropertyRepository {
   // Get all properties by owner ID
   async findAllByOwner (ownerId: string): Promise<Property[]> {
      return prisma.property.findMany({
         where: { OwnerId: ownerId },
         include: {
            category: true,
            location: {
               include: {
                  city: {
                     include: {
                        province: true
                     }
                  }
               }
            },
            mainPicture: true,
            gallery: {
               include: {
                  picture: true
               }
            },
            rooms: {
               include: {
                  roomType: true
               }
            },
            roomTypes: true,
            _count: {
               select: {
                  rooms: true,
                  Reservation: true
               }
            }
         },
         orderBy: { createdAt: 'desc' }
      });
   }

   // Find property by ID with full details
   async findById (id: string): Promise<Property | null> {
      return prisma.property.findUnique({
         where: { id },
         include: {
            category: true,
            location: {
               include: {
                  city: {
                     include: {
                        province: true
                     }
                  }
               }
            },
            Owner: {
               select: {
                  id: true,
                  email: true,
                  profile: {
                     select: {
                        firstName: true,
                        lastName: true,
                        phone: true
                     }
                  }
               }
            },
            mainPicture: true,
            gallery: {
               include: {
                  picture: true
               }
            },
            rooms: {
               include: {
                  roomType: true,
                  gallery: {
                     include: {
                        picture: true
                     }
                  }
               }
            },
            roomTypes: true,
            _count: {
               select: {
                  rooms: true,
                  Reservation: true
               }
            }
         }
      });
   }

   // Find property by ID and owner (for authorization)
   async findByIdAndOwner (id: string, ownerId: string): Promise<Property | null> {
      return prisma.property.findFirst({
         where: {
            id,
            OwnerId: ownerId
         },
         include: {
            category: true,
            location: {
               include: {
                  city: {
                     include: {
                        province: true
                     }
                  }
               }
            },
            mainPicture: true,
            gallery: {
               include: {
                  picture: true
               }
            },
            rooms: {
               include: {
                  roomType: true,
                  gallery: {
                     include: {
                        picture: true
                     }
                  }
               }
            },
            roomTypes: true
         }
      });
   }

   // Create new property
   async create (data: Prisma.PropertyCreateInput): Promise<Property> {
      return prisma.property.create({
         data,
         include: {
            category: true,
            location: {
               include: {
                  city: {
                     include: {
                        province: true
                     }
                  }
               }
            },
            mainPicture: true
         }
      });
   }

   // Update property
   async update (id: string, data: Prisma.PropertyUpdateInput): Promise<Property> {
      return prisma.property.update({
         where: { id },
         data,
         include: {
            category: true,
            location: {
               include: {
                  city: {
                     include: {
                        province: true
                     }
                  }
               }
            },
            mainPicture: true,
            gallery: {
               include: {
                  picture: true
               }
            }
         }
      });
   }

   // Delete property
   async delete (id: string): Promise<Property> {
      return prisma.property.delete({
         where: { id }
      });
   }

   // Check if property has active bookings
   async hasActiveBookings (propertyId: string): Promise<boolean> {
      const activeBookingCount = await prisma.reservation.count({
         where: {
            propertyId,
            orderStatus: {
               in: [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ]
            },
            deletedAt: null
         }
      });
      return activeBookingCount > 0;
   }

   // Get or create location
   async getOrCreateLocation (
      address: string,
      cityId: string,
      latitude?: string | null,
      longitude?: string | null
   ): Promise<string> {
      // First try to find existing location
      const existingLocation = await prisma.location.findFirst({
         where: {
            address,
            cityId
         }
      });

      if (existingLocation) {
         // Update existing location with new lat/lng if provided
         if (latitude !== undefined || longitude !== undefined) {
            await prisma.location.update({
               where: { id: existingLocation.id },
               data: {
                  latitude:
                     latitude !== undefined && latitude !== null && latitude.trim() !== ''
                        ? latitude
                        : existingLocation.latitude,
                  longitude:
                     longitude !== undefined && longitude !== null && longitude.trim() !== ''
                        ? longitude
                        : existingLocation.longitude
               }
            });
         }
         return existingLocation.id;
      }

      // Create new location
      const newLocation = await prisma.location.create({
         data: {
            name: address, // Use address as name for now
            address,
            cityId,
            latitude: latitude !== undefined && latitude !== null && latitude.trim() !== '' ? latitude : null,
            longitude: longitude !== undefined && longitude !== null && longitude.trim() !== '' ? longitude : null
         }
      });

      return newLocation.id;
   }

   // Find city by name and province
   async findCityByNameAndProvince (cityName: string, provinceName: string): Promise<any> {
      return prisma.city.findFirst({
         where: {
            name: {
               equals: cityName,
               mode: 'insensitive'
            },
            province: {
               name: {
                  equals: provinceName,
                  mode: 'insensitive'
               }
            }
         },
         include: {
            province: true
         }
      });
   }

   // Create city if not exists
   async createCityIfNotExists (cityName: string, provinceId: string): Promise<string> {
      const existingCity = await prisma.city.findFirst({
         where: {
            name: {
               equals: cityName,
               mode: 'insensitive'
            },
            provinceId
         }
      });

      if (existingCity) {
         return existingCity.id;
      }

      const newCity = await prisma.city.create({
         data: {
            name: cityName,
            provinceId
         }
      });

      return newCity.id;
   }

   // Find or create province
   async findOrCreateProvince (provinceName: string): Promise<string> {
      const existingProvince = await prisma.province.findFirst({
         where: {
            name: {
               equals: provinceName,
               mode: 'insensitive'
            }
         }
      });

      if (existingProvince) {
         return existingProvince.id;
      }

      const newProvince = await prisma.province.create({
         data: {
            name: provinceName
         }
      });

      return newProvince.id;
   }
}

export default new PropertyRepository();
