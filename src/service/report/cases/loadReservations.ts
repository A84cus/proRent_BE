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
      include: {
         User: { include: { profile: true } },
         Property: {
            include: {
               location: { include: { city: { include: { province: true } } } },
               mainPicture: true,
               roomTypes: true
            }
         },
         RoomType: { select: { id: true, name: true } },
         payment: { select: { invoiceNumber: true, amount: true } }
      },
      orderBy: { startDate: 'asc' }
   });
}
