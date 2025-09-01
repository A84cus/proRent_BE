// service/report/cases/loadReservations.ts
import prisma from '../../../prisma';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export async function loadReservations (
   ownerId: string,
   filters: Omit<ReportInterface.ReportFilters, 'ownerId'>,
   reportStart?: Date,
   reportEnd?: Date
) {
   const where: any = {
      Property: { OwnerId: ownerId },
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId }),
      ...(reportStart && { startDate: { lte: reportEnd } }),
      ...(reportEnd && { endDate: { gte: reportStart } }),
      ...(filters.reservationStatus && { orderStatus: filters.reservationStatus }),
      ...(filters.invoiceNumber && { payment: { invoiceNumber: filters.invoiceNumber } })
   };

   const orConditions = [];

   if (filters.customerName) {
      orConditions.push(
         { User: { profile: { firstName: { contains: filters.customerName, mode: 'insensitive' } } } },
         { User: { profile: { lastName: { contains: filters.customerName, mode: 'insensitive' } } } }
      );
   }

   if (filters.email) {
      orConditions.push({ User: { email: { contains: filters.email, mode: 'insensitive' } } });
   }

   if (filters.search) {
      // Use search term for customer name or email if specific filters aren't provided
      if (!filters.customerName) {
         orConditions.push(
            { User: { profile: { firstName: { contains: filters.search, mode: 'insensitive' } } } },
            { User: { profile: { lastName: { contains: filters.search, mode: 'insensitive' } } } }
         );
      }
      if (!filters.email) {
         orConditions.push({ User: { email: { contains: filters.search, mode: 'insensitive' } } });
      }
      // Optionally, if you want search to also filter properties (requires join or separate query logic)
      // This is more complex and might not be intended for loadReservations.
   }

   if (orConditions.length > 0) {
      where.OR = orConditions;
   }

   return prisma.reservation.findMany({
      where,
      select: {
         // Use 'select' - adjust fields based on actual usage in later steps
         id: true,
         userId: true,
         propertyId: true,
         roomTypeId: true,
         startDate: true,
         endDate: true,
         orderStatus: true,
         User: {
            select: {
               email: true,
               profile: {
                  select: {
                     firstName: true,
                     lastName: true
                  }
               }
            }
         },
         Property: {
            select: {
               // Select only needed property fields
               id: true, // Needed?
               name: true, // Needed for display/filtering?
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
                  select: { id: true } // Only IDs needed for count?
               }
            }
         },
         RoomType: {
            select: {
               // Select only needed room type fields
               id: true,
               name: true
            }
         },
         payment: {
            select: {
               // Select only needed payment fields
               invoiceNumber: true,
               amount: true
            }
         }
      },
      orderBy: { startDate: 'asc' }
   });
}
