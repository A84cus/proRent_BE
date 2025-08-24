// src/services/report/utils/buildSummaryUpdateData.ts

import { Decimal } from '@prisma/client/runtime/library';

interface BuildUpdateDataOptions<T> {
   incrementField?: T;
   absoluteField?: T;
   createDefault: T;
}

/**
 * Builds a single field update object: either { increment: value } or absolute value
 * Used in upsert operations for summary tables.
 */
export function buildFieldUpdate<T> ({ incrementField, absoluteField, createDefault }: BuildUpdateDataOptions<T>): {
   update: any;
   create: T;
} {
   if (incrementField !== undefined) {
      return {
         update: { increment: incrementField },
         create: (createDefault as any) + (incrementField as any) // Works for number, Decimal
      };
   } else if (absoluteField !== undefined) {
      return {
         update: absoluteField,
         create: absoluteField
      };
   } else {
      return {
         update: createDefault,
         create: createDefault
      };
   }
}

/**
 * Builds the full update and create objects for performance summary upsert
 */
export function buildSummaryUpdateData ({
   // Revenue
   incrementTotalRevenue,
   totalRevenue,
   incrementProjectedRevenue,
   projectedRevenue,
   // Reservations
   incrementTotalReservations,
   totalReservations,
   incrementTotalNightsBooked,
   totalNightsBooked,
   // Status counts
   incrementConfirmedCount,
   confirmedCount,
   incrementPendingPaymentCount,
   pendingPaymentCount,
   incrementPendingConfirmationCount,
   pendingConfirmationCount,
   incrementCancelledCount,
   cancelledCount,
   // Users
   incrementUniqueUsers,
   uniqueUsers
}: {
   incrementTotalRevenue?: number | Decimal;
   totalRevenue?: number | Decimal;
   incrementProjectedRevenue?: number | Decimal;
   projectedRevenue?: number | Decimal;
   incrementTotalReservations?: number;
   totalReservations?: number;
   incrementTotalNightsBooked?: number;
   totalNightsBooked?: number;
   incrementConfirmedCount?: number;
   confirmedCount?: number;
   incrementPendingPaymentCount?: number;
   pendingPaymentCount?: number;
   incrementPendingConfirmationCount?: number;
   pendingConfirmationCount?: number;
   incrementCancelledCount?: number;
   cancelledCount?: number;
   incrementUniqueUsers?: number;
   uniqueUsers?: number;
}) {
   const totalRevenueUpdate = buildFieldUpdate<Decimal | number>({
      incrementField: incrementTotalRevenue,
      absoluteField: totalRevenue,
      createDefault: 0
   });

   const projectedRevenueUpdate = buildFieldUpdate<Decimal | number>({
      incrementField: incrementProjectedRevenue,
      absoluteField: projectedRevenue,
      createDefault: 0
   });

   const totalReservationsUpdate = buildFieldUpdate<number>({
      incrementField: incrementTotalReservations,
      absoluteField: totalReservations,
      createDefault: 0
   });

   const totalNightsBookedUpdate = buildFieldUpdate<number>({
      incrementField: incrementTotalNightsBooked,
      absoluteField: totalNightsBooked,
      createDefault: 0
   });

   const confirmedCountUpdate = buildFieldUpdate<number>({
      incrementField: incrementConfirmedCount,
      absoluteField: confirmedCount,
      createDefault: 0
   });

   const pendingPaymentCountUpdate = buildFieldUpdate<number>({
      incrementField: incrementPendingPaymentCount,
      absoluteField: pendingPaymentCount,
      createDefault: 0
   });

   const pendingConfirmationCountUpdate = buildFieldUpdate<number>({
      incrementField: incrementPendingConfirmationCount,
      absoluteField: pendingConfirmationCount,
      createDefault: 0
   });

   const cancelledCountUpdate = buildFieldUpdate<number>({
      incrementField: incrementCancelledCount,
      absoluteField: cancelledCount,
      createDefault: 0
   });

   const uniqueUsersUpdate = buildFieldUpdate<number>({
      incrementField: incrementUniqueUsers,
      absoluteField: uniqueUsers,
      createDefault: 0
   });

   return {
      update: {
         totalRevenue: totalRevenueUpdate.update,
         projectedRevenue: projectedRevenueUpdate.update,
         totalReservations: totalReservationsUpdate.update,
         totalNightsBooked: totalNightsBookedUpdate.update,
         confirmedCount: confirmedCountUpdate.update,
         pendingPaymentCount: pendingPaymentCountUpdate.update,
         pendingConfirmationCount: pendingConfirmationCountUpdate.update,
         cancelledCount: cancelledCountUpdate.update,
         uniqueUsers: uniqueUsersUpdate.update,
         lastUpdated: new Date()
      },
      create: {
         totalRevenue: totalRevenueUpdate.create,
         projectedRevenue: projectedRevenueUpdate.create,
         totalReservations: totalReservationsUpdate.create,
         totalNightsBooked: totalNightsBookedUpdate.create,
         confirmedCount: confirmedCountUpdate.create,
         pendingPaymentCount: pendingPaymentCountUpdate.create,
         pendingConfirmationCount: pendingConfirmationCountUpdate.create,
         cancelledCount: cancelledCountUpdate.create,
         uniqueUsers: uniqueUsersUpdate.create
      }
   };
}
