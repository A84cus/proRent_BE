import { PrismaClient, PeakRate, Prisma, RateType } from "@prisma/client";

const prisma = new PrismaClient();

class PeakRateRepository {
  // Get room with ownership verification
  async findRoomWithOwnership(roomId: string): Promise<any> {
    return prisma.room.findUnique({
      where: { id: roomId },
      include: {
        property: {
          select: {
            id: true,
            OwnerId: true,
          },
        },
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
    });
  }

  // Create peak rate
  async create(data: {
    roomTypeId: string;
    startDate: Date;
    endDate: Date;
    rateType: RateType;
    value: number;
    description?: string;
  }): Promise<PeakRate> {
    return prisma.peakRate.create({
      data: {
        roomTypeId: data.roomTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        rateType: data.rateType,
        value: data.value,
        description: data.description,
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
    });
  }

  // Find peak rates that overlap with date range
  async findOverlappingRates(
    roomTypeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<PeakRate[]> {
    return prisma.peakRate.findMany({
      where: {
        roomTypeId,
        AND: [
          {
            OR: [
              {
                AND: [
                  { startDate: { lte: endDate } },
                  { endDate: { gte: startDate } },
                ],
              },
            ],
          },
        ],
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  // Find peak rate for specific date
  async findByRoomTypeAndDate(
    roomTypeId: string,
    date: Date
  ): Promise<PeakRate | null> {
    return prisma.peakRate.findFirst({
      where: {
        roomTypeId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
    });
  }

  // Update peak rate
  async update(
    id: string,
    data: {
      startDate?: Date;
      endDate?: Date;
      rateType?: RateType;
      value?: number;
      description?: string;
    }
  ): Promise<PeakRate> {
    return prisma.peakRate.update({
      where: { id },
      data,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
    });
  }

  // Delete peak rate
  async delete(id: string): Promise<PeakRate> {
    return prisma.peakRate.delete({
      where: { id },
    });
  }

  // Find peak rate by ID
  async findById(id: string): Promise<PeakRate | null> {
    return prisma.peakRate.findUnique({
      where: { id },
      include: {
        roomType: {
          include: {
            property: {
              select: {
                id: true,
                OwnerId: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new PeakRateRepository();
