import { Property, Prisma } from "@prisma/client";
import publicPropertyRepository from "../../repository/property/publicPropertyRepository";
import logger from "../../utils/system/logger";

// Type definitions for complex Prisma includes
type PropertyWithIncludes = Prisma.PropertyGetPayload<{
  include: {
    category: true;
    location: {
      include: {
        city: {
          include: {
            province: true;
          };
        };
      };
    };
    Owner: {
      select: {
        id: true;
        email: true;
        profile: {
          select: {
            firstName: true;
            lastName: true;
            phone: true;
          };
        };
      };
    };
    mainPicture: true;
    gallery: {
      include: {
        picture: true;
      };
    };
    rooms: {
      include: {
        roomType: true;
        gallery: {
          include: {
            picture: true;
          };
        };
      };
    };
    roomTypes: {
      include: {
        peakRates: true;
      };
    };
    _count: {
      select: {
        rooms: true;
      };
    };
  };
}>;

type PropertySearchResult = Prisma.PropertyGetPayload<{
  include: {
    category: true;
    location: {
      include: {
        city: {
          include: {
            province: true;
          };
        };
      };
    };
    mainPicture: true;
    roomTypes: {
      select: {
        id: true;
        name: true;
        basePrice: true;
        capacity: true;
        totalQuantity: true;
      };
    };
    _count: {
      select: {
        rooms: true;
      };
    };
  };
}>;

type RoomTypeWithIncludes = Prisma.RoomTypeGetPayload<{
  include: {
    rooms: true;
    peakRates: true;
  };
}>;

import { PropertySearchParams } from "../../interfaces/property";

class PublicPropertyService {
  // Search properties with filters and pagination
  async searchProperties(params: PropertySearchParams): Promise<{
    properties: Array<{
      id: string;
      name: string;
      description: string;
      category: { id: string; name: string };
      location: {
        address: string | null;
        city: string;
        province: string;
      };
      mainPicture: { id: string; url: string } | null;
      priceRange: {
        min: number;
        max: number;
      };
      roomCount: number;
      capacity: number;
      createdAt: Date;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      // Validate and sanitize parameters
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(50, Math.max(1, params.limit || 10)); // Max 50 per page

      const searchParams = {
        search: params.search?.trim(),
        categoryId: params.category?.trim(),
        sort: params.sort,
        page,
        limit,
      };

      const result = await publicPropertyRepository.searchProperties(
        searchParams
      );

      // Transform the data for public consumption
      const transformedProperties = result.properties.map((property) => {
        // Type assertion since repository returns expanded data
        const expandedProperty = property as PropertySearchResult;

        return {
          id: expandedProperty.id,
          name: expandedProperty.name,
          description: expandedProperty.description,
          category: expandedProperty.category,
          location: {
            address: expandedProperty.location.address,
            city: expandedProperty.location.city.name,
            province: expandedProperty.location.city.province.name,
          },
          mainPicture: expandedProperty.mainPicture,
          priceRange: {
            min:
              expandedProperty.roomTypes.length > 0
                ? Math.min(
                    ...expandedProperty.roomTypes.map((rt) =>
                      Number(rt.basePrice)
                    )
                  )
                : 0,
            max:
              expandedProperty.roomTypes.length > 0
                ? Math.max(
                    ...expandedProperty.roomTypes.map((rt) =>
                      Number(rt.basePrice)
                    )
                  )
                : 0,
          },
          roomCount: expandedProperty._count.rooms,
          capacity:
            expandedProperty.roomTypes.length > 0
              ? Math.max(...expandedProperty.roomTypes.map((rt) => rt.capacity))
              : 0,
          createdAt: expandedProperty.createdAt,
        };
      });

      return {
        properties: transformedProperties,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      logger.error("Error searching properties:", error);
      throw new Error("Failed to search properties");
    }
  }

  // Get property details for public view
  async getPropertyDetails(id: string): Promise<{
    id: string;
    name: string;
    description: string;
    category: { id: string; name: string };
    location: {
      address: string | null;
      city: string;
      province: string;
      coordinates: { latitude: number; longitude: number } | null;
    };
    owner: {
      name: string;
      phone: string | null;
    };
    pictures: {
      main: { id: string; url: string } | null;
      gallery: { id: string; url: string }[];
    };
    rooms: Array<{
      id: string;
      name: string | null;
      roomType: {
        id: string;
        name: string;
        description: string | null;
        basePrice: number;
        capacity: number;
      };
      isAvailable: boolean;
      pictures: { id: string; url: string }[];
    }>;
    roomTypes: Array<{
      id: string;
      name: string;
      description: string | null;
      basePrice: number;
      capacity: number;
      totalQuantity: number;
      upcomingPeakRates: Array<{
        id: string;
        startDate: Date;
        endDate: Date;
        rateType: string;
        value: number;
        description: string | null;
      }>;
    }>;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      const property = (await publicPropertyRepository.findByIdPublic(
        id
      )) as any;

      if (!property) {
        return null;
      }

      // Transform for public consumption
      return {
        id: property.id,
        name: property.name,
        description: property.description,
        category: property.category,
        location: {
          address: property.location.address,
          city: property.location.city.name,
          province: property.location.city.province.name,
          coordinates:
            property.location.latitude && property.location.longitude
              ? {
                  latitude: Number(property.location.latitude),
                  longitude: Number(property.location.longitude),
                }
              : null,
        },
        owner: {
          name: property.Owner.profile
            ? `${property.Owner.profile.firstName || ""} ${
                property.Owner.profile.lastName || ""
              }`.trim()
            : "Property Owner",
          phone: property.Owner.profile?.phone || null,
        },
        pictures: {
          main: property.mainPicture,
          gallery: property.gallery.map(
            (g: { picture: { id: string; url: string } }) => g.picture
          ),
        },
        rooms: property.rooms.map(
          (room: {
            id: string;
            name: string | null;
            roomType: {
              id: string;
              name: string;
              description: string | null;
              basePrice: number;
              capacity: number;
            };
            isAvailable: boolean;
            gallery: { picture: { id: string; url: string } }[];
          }) => ({
            id: room.id,
            name: room.name,
            roomType: room.roomType,
            isAvailable: room.isAvailable,
            pictures: room.gallery.map(
              (g: { picture: { id: string; url: string } }) => g.picture
            ),
          })
        ),
        roomTypes: property.roomTypes.map(
          (roomType: {
            id: string;
            name: string;
            description: string | null;
            basePrice: number;
            capacity: number;
            totalQuantity: number;
            peakRates: {
              id: string;
              name: string;
              startDate: Date;
              endDate: Date;
              rateType: string;
              value: number;
            }[];
          }) => ({
            id: roomType.id,
            name: roomType.name,
            description: roomType.description,
            basePrice: Number(roomType.basePrice),
            capacity: roomType.capacity,
            totalQuantity: roomType.totalQuantity,
            upcomingPeakRates: roomType.peakRates.map(
              (rate: {
                id: string;
                name: string;
                startDate: Date;
                endDate: Date;
                rateType: string;
                value: number;
              }) => ({
                name: rate.name,
                startDate: rate.startDate,
                endDate: rate.endDate,
                rateType: rate.rateType,
                value: Number(rate.value),
              })
            ),
          })
        ),
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    } catch (error) {
      logger.error("Error getting property details:", error);
      throw new Error("Failed to get property details");
    }
  }

  // Get room types for a property
  async getPropertyRoomTypes(propertyId: string) {
    try {
      const roomTypes = await publicPropertyRepository.findRoomTypesByProperty(
        propertyId
      );

      return roomTypes.map(
        (roomType: RoomTypeWithIncludes & { _count: { rooms: number } }) => ({
          id: roomType.id,
          name: roomType.name,
          description: roomType.description,
          basePrice: Number(roomType.basePrice),
          capacity: roomType.capacity,
          totalQuantity: roomType.totalQuantity,
          availableRooms: roomType._count.rooms,
          rooms: roomType.rooms.map(
            (room: {
              id: string;
              name: string | null;
              isAvailable: boolean;
            }) => ({
              id: room.id,
              name: room.name,
              isAvailable: room.isAvailable,
            })
          ),
          upcomingPeakRates: roomType.peakRates.map((rate) => ({
            name: rate.name || "",
            startDate: rate.startDate,
            endDate: rate.endDate,
            rateType: rate.rateType,
            value: Number(rate.value),
            description: rate.description,
          })),
        })
      );
    } catch (error) {
      logger.error("Error getting property room types:", error);
      throw new Error("Failed to get property room types");
    }
  }

  // Get calendar pricing for property
  async getCalendarPricing(
    propertyId: string,
    days: number = 30
  ): Promise<any> {
    try {
      // Validate days parameter
      const validDays = Math.min(365, Math.max(1, days)); // Max 1 year, min 1 day

      // Check if property exists
      const property = await publicPropertyRepository.findByIdPublic(
        propertyId
      );
      if (!property) {
        throw new Error("Property not found");
      }

      const dailyData =
        await publicPropertyRepository.getDailyPricingAndAvailability(
          propertyId,
          validDays
        );

      return {
        propertyId,
        propertyName: property.name,
        period: {
          startDate: dailyData[0]?.date,
          endDate: dailyData[dailyData.length - 1]?.date,
          totalDays: validDays,
        },
        dailyPricing: dailyData,
      };
    } catch (error) {
      logger.error("Error getting calendar pricing:", error);
      if (error instanceof Error && error.message === "Property not found") {
        throw error;
      }
      throw new Error("Failed to get calendar pricing");
    }
  }

  // Get all categories for filtering
  async getCategories(): Promise<any[]> {
    try {
      return await publicPropertyRepository.findAllCategories();
    } catch (error) {
      logger.error("Error getting categories:", error);
      throw new Error("Failed to get categories");
    }
  }
}

export default new PublicPropertyService();
