// services/report/reportService.ts
import prisma from '../../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import {
   buildAvailabilityMap,
   generateDateRange,
   getAvailabilityRecords,
   getRoomTypeTotalQuantity
} from '../reservationService/availabilityService'; // Adjust path if needed
import {
   PropertyReportFilters,
   PropertyReportItem,
   SalesReportFilters,
   SalesReportItem
} from '../../interfaces/report/reportInterface';

// --- Sales Report ---

export async function generateSalesReport (filters: SalesReportFilters): Promise<SalesReportItem[]> {
   const { ownerId, startDate, endDate } = filters;

   // Define date filter for reservations
   const dateFilter: any = {};
   if (startDate) {
      dateFilter.gte = startDate;
   }
   if (endDate) {
      // Set end date to the end of the day for inclusive filtering
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      dateFilter.lte = adjustedEndDate;
   }

   // --- Fetch Raw Data ---
   // Fetch all confirmed reservations for the owner within the date range
   const reservations = await prisma.reservation.findMany({
      where: {
         Property: {
            OwnerId: ownerId
         },
         orderStatus: 'CONFIRMED',
         createdAt: dateFilter
      },
      select: {
         propertyId: true,
         userId: true,
         payment: {
            select: {
               amount: true // This is Float in Prisma schema, but we'll aggregate as Decimal
            }
         }
      }
   });

   // --- Aggregate Data in Memory ---
   // Group data by property
   const propertyMap: Record<string, { totalSales: Decimal; transactionCount: number; userIds: Set<string> }> = {};

   for (const reservation of reservations) {
      const propertyId = reservation.propertyId;
      const amount = new Decimal(reservation.payment?.amount ?? 0); // Convert Float to Decimal
      const userId = reservation.userId;

      if (!propertyMap[propertyId]) {
         propertyMap[propertyId] = {
            totalSales: new Decimal(0),
            transactionCount: 0,
            userIds: new Set()
         };
      }

      propertyMap[propertyId].totalSales = propertyMap[propertyId].totalSales.plus(amount);
      propertyMap[propertyId].transactionCount += 1;
      propertyMap[propertyId].userIds.add(userId);
   }

   // --- Fetch Property Names ---
   const propertyIds = Object.keys(propertyMap);
   const properties = await prisma.property.findMany({
      where: {
         id: { in: propertyIds }
      },
      select: {
         id: true,
         name: true
      }
   });

   const propertyNameMap: Record<string, string> = {};
   properties.forEach(prop => {
      propertyNameMap[prop.id] = prop.name;
   });

   // --- Build Report Items ---
   const salesReportItems: SalesReportItem[] = Object.entries(propertyMap).map(([ propertyId, data ]) => ({
      propertyId,
      propertyName: propertyNameMap[propertyId] || 'Unknown Property',
      totalSales: data.totalSales,
      transactionCount: data.transactionCount,
      uniqueUsers: data.userIds.size
   }));

   // --- Sorting ---
   // Handle sorting post-aggregation since complex sorting with groupBy is difficult
   if (filters.sortBy === 'totalSales') {
      salesReportItems.sort((a, b) => b.totalSales.minus(a.totalSales).toNumber()); // Sort descending by sales
   } else {
      // Default sort by property name
      salesReportItems.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
   }

   return salesReportItems;
}

// --- Property Report (Data Fetching) ---

export async function fetchPropertyReportData (filters: PropertyReportFilters): Promise<PropertyReportItem[]> {
   const { ownerId, startDate, endDate } = filters;

   // Validate date range if needed (using your existing function)
   // generateDateRange(startDate, endDate); // Could throw error

   // Fetch properties and their room types for the owner
   const properties = await prisma.property.findMany({
      where: {
         OwnerId: ownerId
      },
      select: {
         id: true,
         name: true,
         roomTypes: {
            select: {
               id: true,
               name: true,
               totalQuantity: true
               // We will fetch availability records separately based on date range
            }
         }
      },
      orderBy: {
         name: 'asc' // Sort properties by name
      }
   });
   const reportItems: PropertyReportItem[] = properties.map(property => ({
      propertyId: property.id,
      propertyName: property.name,
      roomTypes: property.roomTypes.map(rt => ({
         roomTypeId: rt.id,
         roomTypeName: rt.name,
         totalQuantity: rt.totalQuantity,
         availability: [] // Will be populated based on date range
      }))
   }));

   return reportItems;
}

export async function fetchRoomTypeAvailabilities (
   roomTypeIds: string[],
   startDate: Date,
   endDate: Date
): Promise<Record<string, { date: Date; availableCount: number }[]>> {
   const availabilityMap: Record<string, { date: Date; availableCount: number }[]> = {};

   // Generate the list of dates to check once
   const datesToCheck = generateDateRange(startDate, endDate);

   // Process each room type
   for (const roomTypeId of roomTypeIds) {
      try {
         // 1. Get the total quantity for this room type (used as default)
         const totalQuantity = await getRoomTypeTotalQuantity(roomTypeId);

         // 2. Fetch existing availability records for these dates
         const availabilityRecords = await getAvailabilityRecords(roomTypeId, datesToCheck);

         // 3. Build a map for quick lookup of availableCount by date string
         const availabilityLookupMap = buildAvailabilityMap(availabilityRecords);

         // 4. Construct the result array for this room type
         const availabilityData: { date: Date; availableCount: number }[] = [];

         for (const date of datesToCheck) {
            const dateKey = date.toISOString().split('T')[0];
            // 5. Determine available count: use record value, or default to totalQuantity
            const availableCount = availabilityLookupMap.has(dateKey)
               ? availabilityLookupMap.get(dateKey)!
               : totalQuantity;

            availabilityData.push({
               date: new Date(date),
               availableCount
            });
         }
         // 6. Store the result for this room type
         availabilityMap[roomTypeId] = availabilityData;
      } catch (error) {
         console.error(`Error fetching availability for roomTypeId ${roomTypeId}:`, error);
         availabilityMap[roomTypeId] = [];
         throw error;
      }
   }

   return availabilityMap;
}
