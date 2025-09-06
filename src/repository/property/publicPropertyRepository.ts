import { PrismaClient, Property, Prisma } from "@prisma/client";
import prisma from "../../prisma";

interface PropertySearchParams {
  search?: string;
  categoryId?: string;
  sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc";
  page?: number;
  limit?: number;
}

class PublicPropertyRepository {
  // Search properties with filters and pagination
  async searchProperties(params: PropertySearchParams): Promise<{
    properties: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        {
          location: {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { address: { contains: params.search, mode: "insensitive" } },
              {
                city: {
                  name: { contains: params.search, mode: "insensitive" },
                },
              },
              {
                city: {
                  province: {
                    name: { contains: params.search, mode: "insensitive" },
                  },
                },
              },
            ],
          },
        },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    // Build order by
    let orderBy: Prisma.PropertyOrderByWithRelationInput = {
      createdAt: "desc",
    };

    if (params.sort) {
      switch (params.sort) {
        case "price_asc":
        case "price_desc":
          // For price sorting, we'll sort by the minimum room type price after fetching
          orderBy = { name: "asc" }; // Use name sorting as fallback, we'll sort by price in post-processing
          break;
        case "name_asc":
          orderBy = { name: "asc" };
          break;
        case "name_desc":
          orderBy = { name: "desc" };
          break;
      }
    }

    const [propertiesRaw, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          category: true,
          location: {
            include: {
              city: {
                include: {
                  province: true,
                },
              },
            },
          },
          mainPicture: true,
          roomTypes: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              capacity: true,
              totalQuantity: true,
            },
            orderBy: { basePrice: "asc" },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Sort by price if needed
    let properties = propertiesRaw;
    if (params.sort === "price_asc" || params.sort === "price_desc") {
      properties = propertiesRaw.sort((a, b) => {
        const aMinPrice =
          a.roomTypes.length > 0
            ? Math.min(...a.roomTypes.map((rt) => Number(rt.basePrice)))
            : 0;
        const bMinPrice =
          b.roomTypes.length > 0
            ? Math.min(...b.roomTypes.map((rt) => Number(rt.basePrice)))
            : 0;

        return params.sort === "price_asc"
          ? aMinPrice - bMinPrice
          : bMinPrice - aMinPrice;
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      properties,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Get property by ID for public view
  async findByIdPublic(id: string): Promise<Property | null> {
    return prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        location: {
          include: {
            city: {
              include: {
                province: true,
              },
            },
          },
        },
        Owner: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        mainPicture: true,
        gallery: {
          include: {
            picture: true,
          },
        },
        rooms: {
          include: {
            roomType: true,
            gallery: {
              include: {
                picture: true,
              },
            },
          },
        },
        roomTypes: {
          include: {
            peakRates: {
              where: {
                endDate: { gte: new Date() },
              },
              orderBy: { startDate: "asc" },
            },
          },
        },
      },
    });
  }

  // Get room types for a property
  async findRoomTypesByProperty(propertyId: string): Promise<any[]> {
    return prisma.roomType.findMany({
      where: { propertyId },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            isAvailable: true,
          },
        },
        peakRates: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: { basePrice: "asc" },
    });
  }

  // Get daily pricing and availability for property
  async getDailyPricingAndAvailability(
    propertyId: string,
    days: number
  ): Promise<any[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    // Get all room types for the property
    const roomTypes = await prisma.roomType.findMany({
      where: { propertyId },
      include: {
        peakRates: {
          where: {
            OR: [
              {
                AND: [
                  { startDate: { lte: endDate } },
                  { endDate: { gte: startDate } },
                ],
              },
            ],
          },
        },
        availabilities: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        rooms: {
          include: {
            availabilities: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
            reservations: {
              where: {
                orderStatus: {
                  in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                },
                deletedAt: null,
                OR: [
                  {
                    AND: [
                      { startDate: { lte: endDate } },
                      { endDate: { gte: startDate } },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    });

    // Build daily data
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const roomTypeData = roomTypes.map((roomType) => {
        // Calculate pricing for this date
        const applicablePeakRate = roomType.peakRates.find(
          (rate) =>
            currentDate >= new Date(rate.startDate) &&
            currentDate <= new Date(rate.endDate)
        );

        let finalPrice = Number(roomType.basePrice);
        if (applicablePeakRate) {
          if (applicablePeakRate.rateType === "PERCENTAGE") {
            finalPrice =
              finalPrice * (1 + Number(applicablePeakRate.value) / 100);
          } else {
            finalPrice = finalPrice + Number(applicablePeakRate.value);
          }
        }

        // Calculate availability
        const roomTypeAvailability = roomType.availabilities.find(
          (av) => av.date.toDateString() === currentDate.toDateString()
        );

        let totalAvailable = roomType.totalQuantity;
        if (roomTypeAvailability) {
          totalAvailable = roomTypeAvailability.availableCount;
        }

        // Subtract rooms with reservations
        const reservedRooms = roomType.rooms.filter((room) =>
          room.reservations.some(
            (res) =>
              currentDate >= new Date(res.startDate) &&
              currentDate <= new Date(res.endDate)
          )
        ).length;

        totalAvailable = Math.max(0, totalAvailable - reservedRooms);

        return {
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          basePrice: Number(roomType.basePrice),
          finalPrice: Math.round(finalPrice * 100) / 100,
          available: totalAvailable,
          peakRate: applicablePeakRate
            ? {
                name: applicablePeakRate.name,
                value: Number(applicablePeakRate.value),
                rateType: applicablePeakRate.rateType,
              }
            : null,
        };
      });

      dailyData.push({
        date: currentDate.toISOString().split("T")[0],
        roomTypes: roomTypeData,
      });
    }

    return dailyData;
  }

  // Get all categories for filtering
  async findAllCategories(): Promise<any[]> {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            properties: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // Find room type by ID (public access)
  async findRoomTypeById(roomTypeId: string): Promise<any> {
    return prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        capacity: true,
        totalQuantity: true,
        isWholeUnit: true,
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

export default new PublicPropertyRepository();
