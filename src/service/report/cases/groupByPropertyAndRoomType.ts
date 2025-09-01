import { Status } from '@prisma/client';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
import prisma from '../../../prisma';

export async function groupByPropertyAndRoomType (
   reservations: any[],
   ownerId: string
): Promise<{
   propertyMap: Map<string, ReportInterface.PropertySummary>;
   roomTypeMap: Map<string, ReportInterface.RoomTypeWithAvailability>;
}> {
   const propertyMap = new Map<string, ReportInterface.PropertySummary>();
   const roomTypeMap = new Map<string, ReportInterface.RoomTypeWithAvailability>();

   // Step 1: Load ALL room types for the owner
   const allRoomTypes = await prisma.roomType.findMany({
      where: { property: { OwnerId: ownerId } },
      select: {
         // Use 'select'
         id: true,
         name: true,
         propertyId: true,
         property: {
            select: {
               // Select only needed property fields
               id: true,
               name: true,
               rentalType: true, // Needed?
               mainPicture: {
                  select: { url: true } // Only URL needed
               },
               location: {
                  select: {
                     // Select only needed location fields
                     address: true,
                     city: {
                        select: {
                           name: true,
                           province: {
                              select: { name: true }
                           }
                        }
                     }
                  }
               },
               roomTypes: {
                  select: { id: true } // Only IDs needed for count
               }
            }
         }
      }
   });

   // Step 2: Initialize all room types and their corresponding properties
   for (const rt of allRoomTypes) {
      const rtid = rt.id;
      const pid = rt.propertyId;

      // Initialize room type if not exists in map
      if (!roomTypeMap.has(rtid)) {
         roomTypeMap.set(rtid, {
            roomType: { id: rt.id, name: rt.name },
            counts: { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
            revenue: { actual: 0, projected: 0, average: 0 },
            uniqueCustomers: 0,
            availability: { totalQuantity: 0, dates: [] },
            reservationListItems: [],
            pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
            totalAmount: 0
         });
      }

      // Initialize property if not exists in map
      if (!propertyMap.has(pid)) {
         const p = rt.property;
         const loc = p.location;
         const cit = loc?.city;
         propertyMap.set(pid, {
            property: {
               id: p.id,
               name: p.name,
               Picture: p.mainPicture?.url ?? null,
               address: loc?.address ?? null,
               city: cit?.name ?? null,
               province: cit?.province?.name ?? null,
               rentalType: p.rentalType
            },
            period: { startDate: null, endDate: null },
            summary: {
               counts: { PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
               revenue: { actual: 0, projected: 0, average: 0 },
               totalRoomTypes: p.roomTypes.length // Count from included roomTypes
            },
            // Start with an empty array of the correct type
            roomTypes: []
         });
      }

      // Get the property entry and the room type object
      const propEntry = propertyMap.get(pid);
      const roomTypeEntry = roomTypeMap.get(rtid);

      if (propEntry && roomTypeEntry) {
         const isAlreadyAdded = propEntry.roomTypes.some(rtObj => rtObj.roomType.id === rtid);
         if (!isAlreadyAdded) {
            propEntry.roomTypes.push(roomTypeEntry);
         }
      }
   }

   // Step 3: Process reservations (only updates counts/revenue for room types that have reservations)
   for (const r of reservations) {
      const pid = r.propertyId;
      const rtid = r.roomTypeId;
      const status = r.orderStatus as Status;
      const amount = r.payment?.amount || 0;

      // Get the property and room type summaries from the maps
      const prop = propertyMap.get(pid);
      const roomType = roomTypeMap.get(rtid);

      // Skip if property/room type not found in maps (shouldn't happen if data is consistent)
      if (!prop || !roomType) {
         console.warn(
            `Reservation ${r.id} references unknown property ${pid} or room type ${rtid} for owner ${ownerId}`
         );
         continue;
      }

      // Update counts and revenue based on reservation status
      prop.summary.counts[status]++;
      roomType.counts[status]++;

      if (r.orderStatus === 'CONFIRMED') {
         prop.summary.revenue.actual += amount;
         roomType.revenue.actual += amount;
      }

      if ([ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED' ].includes(r.orderStatus) && amount > 0) {
         prop.summary.revenue.projected += amount;
         roomType.revenue.projected += amount;
      }
   }

   return { propertyMap, roomTypeMap };
}
