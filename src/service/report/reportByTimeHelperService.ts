// services/report/reportByTimeHelperService.ts
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../prisma'; // Adjust path as needed

// --- Helper Functions (Internal) ---

export async function validatePropertyOwnership (ownerId: string, propertyId: string): Promise<void> {
   const propertyCheck = await prisma.property.findUnique({
      where: { id: propertyId, OwnerId: ownerId },
      select: { id: true }
   });
   if (!propertyCheck) {
      throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
   }
}

export async function validateRoomTypeOwnership (ownerId: string, roomTypeId: string): Promise<void> {
   const roomTypeCheck = await prisma.roomType.findUnique({
      where: { id: roomTypeId, property: { OwnerId: ownerId } },
      select: { id: true }
   });
   if (!roomTypeCheck) {
      throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
   }
}

export function buildDateFilter (filters: { startDate?: Date; endDate?: Date }): any {
   const { startDate, endDate } = filters;
   const dateFilter: any = {};
   if (startDate) {
      dateFilter.gte = startDate;
   }
   if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      dateFilter.lte = adjustedEndDate;
   }
   return dateFilter;
}

export function getGroupByFields (period: 'year' | 'month' | 'day'): any[] {
   switch (period) {
      case 'year':
         return [ 'createdAt_year' ];
      case 'month':
         return [ 'createdAt_year', 'createdAt_month' ];
      case 'day':
         return [ 'createdAt_year', 'createdAt_month', 'createdAt_day' ];
      default:
         throw new Error(`Unsupported period: ${period}`);
   }
}

export function calculateSpecificDateFilter (periodGroup: any, baseDateFilter: any): any {
   const specificDateFilter: any = { ...baseDateFilter };

   if (periodGroup.createdAt_year !== null && periodGroup.createdAt_year !== undefined) {
      const yearStart = new Date(periodGroup.createdAt_year, 0, 1);
      const yearEnd = new Date(periodGroup.createdAt_year, 11, 31, 23, 59, 59, 999);
      specificDateFilter.gte = specificDateFilter.gte
         ? new Date(Math.max(specificDateFilter.gte.getTime(), yearStart.getTime()))
         : yearStart;
      specificDateFilter.lte = specificDateFilter.lte
         ? new Date(Math.min(specificDateFilter.lte.getTime(), yearEnd.getTime()))
         : yearEnd;
   }

   if (periodGroup.createdAt_month !== null && periodGroup.createdAt_month !== undefined) {
      const monthStart = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month - 1, 1);
      const monthEnd = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month, 0, 23, 59, 59, 999);
      specificDateFilter.gte = specificDateFilter.gte
         ? new Date(Math.max(specificDateFilter.gte.getTime(), monthStart.getTime()))
         : monthStart;
      specificDateFilter.lte = specificDateFilter.lte
         ? new Date(Math.min(specificDateFilter.lte.getTime(), monthEnd.getTime()))
         : monthEnd;
   }

   if (periodGroup.createdAt_day !== null && periodGroup.createdAt_day !== undefined) {
      const dayStart = new Date(periodGroup.createdAt_year, periodGroup.createdAt_month - 1, periodGroup.createdAt_day);
      const dayEnd = new Date(
         periodGroup.createdAt_year,
         periodGroup.createdAt_month - 1,
         periodGroup.createdAt_day,
         23,
         59,
         59,
         999
      );
      specificDateFilter.gte = specificDateFilter.gte
         ? new Date(Math.max(specificDateFilter.gte.getTime(), dayStart.getTime()))
         : dayStart;
      specificDateFilter.lte = specificDateFilter.lte
         ? new Date(Math.min(specificDateFilter.lte.getTime(), dayEnd.getTime()))
         : dayEnd;
   }

   return specificDateFilter;
}

export async function fetchReservationIdsForPeriod (
   identifier: { propertyId?: string; roomTypeId?: string },
   dateFilter: any
): Promise<string[]> {
   const whereClause: any = {
      orderStatus: 'CONFIRMED',
      createdAt: dateFilter,
      ...identifier // Spread propertyId or roomTypeId
   };

   const reservations = await prisma.reservation.findMany({
      where: whereClause,
      select: { id: true }
   });

   return reservations.map(r => r.id);
}

export async function aggregatePayments (reservationIds: string[]): Promise<Decimal> {
   if (reservationIds.length === 0) {
      return new Decimal(0);
   }

   const paymentAggregation = await prisma.payment.aggregate({
      where: { reservationId: { in: reservationIds } },
      _sum: { amount: true }
   });

   return new Decimal(paymentAggregation._sum.amount ?? 0);
}

/**
 * Formats the period string based on the period type and group data.
 */
export function formatPeriodString (period: 'year' | 'month' | 'day', periodGroup: any): string {
   if (period === 'year') {
      return `${periodGroup.createdAt_year}`;
   } else if (period === 'month') {
      const monthStr = String(periodGroup.createdAt_month).padStart(2, '0');
      return `${periodGroup.createdAt_year}-${monthStr}`;
   } else {
      // day
      const monthStr = String(periodGroup.createdAt_month).padStart(2, '0');
      const dayStr = String(periodGroup.createdAt_day).padStart(2, '0');
      return `${periodGroup.createdAt_year}-${monthStr}-${dayStr}`;
   }
}
