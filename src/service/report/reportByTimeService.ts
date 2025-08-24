// services/report/reportByTimeService.ts
import prisma from '../../prisma';
import {
   MostReservedMonthResult,
   ReservationOccupancyData,
   TimeSeriesDataPoint
} from '../../interfaces/report/reportInterface';
import {
   buildDateFilter,
   getGroupByFields,
   validatePropertyOwnership,
   calculateSpecificDateFilter,
   formatPeriodString,
   fetchReservationIdsForPeriod,
   aggregatePayments,
   validateRoomTypeOwnership
} from './reportByTimeHelperService';
import { generateDateRange } from '../reservationService/availabilityService';

export async function getPropertySalesOverTime (
   ownerId: string,
   propertyId: string,
   period: 'year' | 'month' | 'day',
   filters: { startDate?: Date; endDate?: Date } = {}
): Promise<TimeSeriesDataPoint[]> {
   await validatePropertyOwnership(ownerId, propertyId);
   const dateFilter = buildDateFilter(filters);
   const groupByFields = getGroupByFields(period);
   const orderByField = groupByFields[groupByFields.length - 1];

   const distinctPeriodsQuery: any[] = await prisma.reservation.groupBy({
      by: groupByFields as any,
      where: { propertyId, orderStatus: 'CONFIRMED', createdAt: dateFilter },
      _count: { _all: true },
      orderBy: { [orderByField]: 'asc' } as any
   } as any);

   const resultPromises = distinctPeriodsQuery.map(async (periodGroup: any) => {
      const specificDateFilter = calculateSpecificDateFilter(periodGroup, dateFilter);
      const reservationIds = await fetchReservationIdsForPeriod({ propertyId }, specificDateFilter);
      const totalSalesAmount = await aggregatePayments(reservationIds);
      const periodString = formatPeriodString(period, periodGroup);

      return {
         period: periodString,
         totalSales: totalSalesAmount,
         transactionCount: periodGroup._count._all
      };
   });

   const result: TimeSeriesDataPoint[] = await Promise.all(resultPromises);
   return result.sort((a, b) => a.period.localeCompare(b.period));
}

export async function getRoomTypeSalesOverTime (
   ownerId: string,
   roomTypeId: string,
   period: 'year' | 'month' | 'day',
   filters: { startDate?: Date; endDate?: Date } = {}
): Promise<TimeSeriesDataPoint[]> {
   await validateRoomTypeOwnership(ownerId, roomTypeId);
   const dateFilter = buildDateFilter(filters);
   const groupByFields = getGroupByFields(period);
   const orderByField = groupByFields[groupByFields.length - 1];

   const distinctPeriodsQuery: any[] = await prisma.reservation.groupBy({
      by: groupByFields as any,
      where: { roomTypeId, orderStatus: 'CONFIRMED', createdAt: dateFilter },
      _count: { _all: true },
      orderBy: { [orderByField]: 'asc' } as any
   } as any);

   const resultPromises = distinctPeriodsQuery.map(async (periodGroup: any) => {
      const specificDateFilter = calculateSpecificDateFilter(periodGroup, dateFilter);
      const reservationIds = await fetchReservationIdsForPeriod({ roomTypeId }, specificDateFilter);
      const totalSalesAmount = await aggregatePayments(reservationIds);
      const periodString = formatPeriodString(period, periodGroup);

      return {
         period: periodString,
         totalSales: totalSalesAmount,
         transactionCount: periodGroup._count._all
      };
   });

   const result: TimeSeriesDataPoint[] = await Promise.all(resultPromises);
   return result.sort((a, b) => a.period.localeCompare(b.period));
}

export async function getMostReservedMonth (
   ownerId: string,
   filters: { startDate?: Date; endDate?: Date } = {}
): Promise<MostReservedMonthResult | null> {
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

   const aggregatedData = await prisma.reservation.groupBy({
      by: [ 'createdAt_month', 'createdAt_year' ],
      where: {
         Property: {
            OwnerId: ownerId
         },
         orderStatus: 'CONFIRMED',
         createdAt: dateFilter
      },
      _count: {
         _all: true
      },
      orderBy: {
         _count: {
            _all: 'desc'
         }
      },
      take: 1
   } as any);

   // Map result
   if (aggregatedData.length > 0) {
      const topMonthData: any = aggregatedData[0];
      const monthStr = String(topMonthData.createdAt_month).padStart(2, '0');
      const yearMonthString = `${topMonthData.createdAt_year}-${monthStr}`;

      return {
         yearMonth: yearMonthString,
         reservationCount: topMonthData._count._all
      };
   }

   return null;
}

export async function calculateOccupancyByReservations (
   roomTypeIds: string[],
   startDate: Date,
   endDate: Date
): Promise<Record<string, ReservationOccupancyData[]>> {
   const occupancyMap: Record<string, ReservationOccupancyData[]> = {};

   const datesToCheck = generateDateRange(startDate, endDate); // Use your existing function

   for (const roomTypeId of roomTypeIds) {
      const dailyOccupancy: ReservationOccupancyData[] = [];

      for (const date of datesToCheck) {
         const count = await prisma.reservation.count({
            where: {
               roomTypeId,
               orderStatus: 'CONFIRMED',
               startDate: { lte: date },
               endDate: { gt: date }
            }
         });
         dailyOccupancy.push({
            date: new Date(date),
            occupiedCount: count
         });
      }
      occupancyMap[roomTypeId] = dailyOccupancy;
   }
   return occupancyMap;
}
