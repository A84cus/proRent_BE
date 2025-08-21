// services/report/reportDetailService.ts
import prisma from '../../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { RoomTypeSalesItem } from '../../interfaces/report/reportInterface';

// --- Sales Report ---

export async function generateRoomTypeSalesReport (
   ownerId: string,
   filters: { startDate?: Date; endDate?: Date }
): Promise<RoomTypeSalesItem[]> {
   const { startDate, endDate } = filters;

   // Define date filter for reservations
   const dateFilter: any = {};
   if (startDate) {
      dateFilter.gte = startDate;
   }
   if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      dateFilter.lte = adjustedEndDate;
   }
   // --- Fetch Raw Data ---
   // Fetch confirmed reservations for ROOM_BY_ROOM properties owned by the user
   const reservations = await prisma.reservation.findMany({
      where: {
         Property: {
            OwnerId: ownerId,
            rentalType: 'ROOM_BY_ROOM' // Filter for ROOM_BY_ROOM properties
         },
         orderStatus: 'CONFIRMED', // Only confirmed reservations
         createdAt: dateFilter
      },
      select: {
         roomTypeId: true,
         propertyId: true,
         userId: true,
         payment: {
            select: {
               amount: true
            }
         }
      }
   });

   // --- Aggregate Data in Memory ---
   const roomTypeMap: Record<
      string,
      { totalSales: Decimal; transactionCount: number; userIds: Set<string>; propertyId: string }
   > = {};

   for (const reservation of reservations) {
      const roomTypeId = reservation.roomTypeId;
      const propertyId = reservation.propertyId; // Capture propertyId here
      const amount = new Decimal(reservation.payment?.amount ?? 0);
      const userId = reservation.userId;

      if (!roomTypeMap[roomTypeId]) {
         roomTypeMap[roomTypeId] = {
            totalSales: new Decimal(0),
            transactionCount: 0,
            userIds: new Set(),
            propertyId // Associate room type with its property
         };
      }

      roomTypeMap[roomTypeId].totalSales = roomTypeMap[roomTypeId].totalSales.plus(amount);
      roomTypeMap[roomTypeId].transactionCount += 1;
      roomTypeMap[roomTypeId].userIds.add(userId);
      // propertyId is already captured during initialization
   }

   // --- Fetch RoomType and Property Names ---
   const roomTypeIds = Object.keys(roomTypeMap);
   const roomTypes = await prisma.roomType.findMany({
      where: {
         id: { in: roomTypeIds }
      },
      select: {
         id: true,
         name: true,
         property: {
            select: {
               id: true,
               name: true
            }
         }
      }
   });

   const roomTypeNameMap: Record<string, { name: string; propertyId: string; propertyName: string }> = {};
   roomTypes.forEach(rt => {
      roomTypeNameMap[rt.id] = {
         name: rt.name,
         propertyId: rt.property.id,
         propertyName: rt.property.name
      };
   });

   // --- Build Report Items ---
   const roomTypeSalesItems: RoomTypeSalesItem[] = Object.entries(roomTypeMap).map(([ roomTypeId, data ]) => {
      const names = roomTypeNameMap[roomTypeId] || {
         name: 'Unknown Room Type',
         propertyId: data.propertyId,
         propertyName: 'Unknown Property'
      };

      return {
         roomTypeId,
         roomTypeName: names.name,
         propertyId: names.propertyId, // Get propertyId from the name map or data
         propertyName: names.propertyName,
         totalSales: data.totalSales,
         transactionCount: data.transactionCount,
         uniqueUsers: data.userIds.size
      };
   });

   // Sort by total sales descending (can be adjusted)
   roomTypeSalesItems.sort((a, b) => b.totalSales.minus(a.totalSales).toNumber());

   return roomTypeSalesItems;
}
