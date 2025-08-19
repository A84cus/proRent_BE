import { PrismaClient, Availability, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class AvailabilityRepository {
  // Get availability for a specific room for a month
  async findRoomAvailabilityByMonth(
    roomId: string,
    year: number,
    month: number
  ): Promise<Availability[]> {
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

    return prisma.availability.findMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            propertyId: true,
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
      orderBy: { date: "asc" },
    });
  }

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

  // Bulk upsert availability for specific room
  async bulkUpsertRoomAvailability(
    roomId: string,
    roomTypeId: string,
    availabilityData: { date: Date; isAvailable: boolean }[]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const data of availabilityData) {
        await tx.availability.upsert({
          where: {
            roomId_date: {
              roomId,
              date: data.date,
            },
          },
          update: {
            availableCount: data.isAvailable ? 1 : 0,
          },
          create: {
            date: data.date,
            availableCount: data.isAvailable ? 1 : 0,
            roomTypeId,
            roomId,
          },
        });
      }
    });
  }

  // Get availability conflicts (existing reservations)
  async getReservationConflicts(roomId: string, dates: Date[]): Promise<any[]> {
    return prisma.reservation.findMany({
      where: {
        roomId,
        orderStatus: {
          in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
        },
        deletedAt: null,
        OR: dates.map((date) => ({
          AND: [{ startDate: { lte: date } }, { endDate: { gte: date } }],
        })),
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        orderStatus: true,
      },
    });
  }

  // Generate date range for a month
  generateMonthDates(year: number, month: number): Date[] {
    const dates: Date[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month - 1, day));
    }

    return dates;
  }

  // Get existing availability for dates to check what's missing
  async getExistingAvailability(
    roomId: string,
    dates: Date[]
  ): Promise<Availability[]> {
    return prisma.availability.findMany({
      where: {
        roomId,
        date: {
          in: dates,
        },
      },
    });
  }

  // Get peak rates for a room type in a date range
  async getPeakRates(
    roomTypeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return prisma.peakRate.findMany({
      where: {
        roomTypeId,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
      orderBy: { startDate: "asc" },
    });
  }
}

export default new AvailabilityRepository();
