// src/services/report/propertyPerformanceSummaryService.ts
import prisma from '../../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { PropertyPerformanceSummary } from '@prisma/client';
import { UpsertPropertyPerformanceSummaryInput } from '../../interfaces/report/reportDashboardInterface';

// --- Service Functions ---
export async function findPropertyPerformanceSummary (
   ownerId: string,
   propertyId: string,
   periodType: string,
   periodKey: string
): Promise<PropertyPerformanceSummary | null> {
   // First, verify the property belongs to the owner
   const propertyCheck = await prisma.property.findUnique({
      where: {
         id: propertyId,
         OwnerId: ownerId
      },
      select: {
         id: true
      }
   });

   if (!propertyCheck) {
      // Property doesn't exist or doesn't belong to the owner
      return null;
   }

   // If ownership is valid, find the summary record
   return await prisma.propertyPerformanceSummary.findUnique({
      where: {
         propertyId_periodType_periodKey: {
            propertyId,
            periodType,
            periodKey
         }
      }
   });
}

export async function upsertPropertyPerformanceSummary (
   data: UpsertPropertyPerformanceSummaryInput
): Promise<PropertyPerformanceSummary> {
   const {
      propertyId,
      periodType,
      periodKey,
      year,
      month,
      incrementTotalRevenue,
      totalRevenue,
      incrementProjectedRevenue,
      projectedRevenue,
      incrementTotalReservations,
      totalReservations,
      incrementConfirmedCount,
      confirmedCount,
      incrementPendingPaymentCount,
      pendingPaymentCount,
      incrementPendingConfirmationCount,
      pendingConfirmationCount,
      incrementCancelledCount,
      cancelledCount,
      incrementUniqueUsers,
      uniqueUsers,
      OwnerId
   } = data;

   const updateData: any = {};

   if (incrementTotalRevenue !== undefined) {
      updateData.totalRevenue = { increment: new Decimal(incrementTotalRevenue) };
   } else if (totalRevenue !== undefined) {
      updateData.totalRevenue = new Decimal(totalRevenue);
   }

   if (incrementProjectedRevenue !== undefined) {
      updateData.projectedRevenue = { increment: new Decimal(incrementProjectedRevenue) };
   } else if (projectedRevenue !== undefined) {
      updateData.projectedRevenue = new Decimal(projectedRevenue);
   }
   if (incrementTotalReservations !== undefined) {
      updateData.totalReservations = { increment: incrementTotalReservations };
   } else if (totalReservations !== undefined) {
      updateData.totalReservations = totalReservations;
   }
   if (incrementConfirmedCount !== undefined) {
      updateData.confirmedCount = { increment: incrementConfirmedCount };
   } else if (confirmedCount !== undefined) {
      updateData.confirmedCount = confirmedCount;
   }

   if (incrementPendingPaymentCount !== undefined) {
      updateData.pendingPaymentCount = { increment: incrementPendingPaymentCount };
   } else if (pendingPaymentCount !== undefined) {
      updateData.pendingPaymentCount = pendingPaymentCount;
   }

   if (incrementPendingConfirmationCount !== undefined) {
      updateData.pendingConfirmationCount = { increment: incrementPendingConfirmationCount };
   } else if (pendingConfirmationCount !== undefined) {
      updateData.pendingConfirmationCount = pendingConfirmationCount;
   }

   if (incrementCancelledCount !== undefined) {
      updateData.cancelledCount = { increment: incrementCancelledCount };
   } else if (cancelledCount !== undefined) {
      updateData.cancelledCount = cancelledCount;
   }
   if (incrementUniqueUsers !== undefined) {
      updateData.uniqueUsers = { increment: incrementUniqueUsers };
   } else if (uniqueUsers !== undefined) {
      updateData.uniqueUsers = uniqueUsers;
   }
   updateData.lastUpdated = new Date();

   return await prisma.propertyPerformanceSummary.upsert({
      where: {
         propertyId_periodType_periodKey: {
            propertyId,
            periodType,
            periodKey
         }
      },
      update: updateData,
      create: {
         propertyId,
         periodType,
         periodKey,
         year,
         month: month ?? null,
         totalRevenue: new Decimal(totalRevenue ?? incrementTotalRevenue ?? 0),
         projectedRevenue: new Decimal(projectedRevenue ?? incrementProjectedRevenue ?? 0),
         totalReservations: totalReservations ?? incrementTotalReservations ?? 0,
         confirmedCount: confirmedCount ?? incrementConfirmedCount ?? 0,
         pendingPaymentCount: pendingPaymentCount ?? incrementPendingPaymentCount ?? 0,
         pendingConfirmationCount: pendingConfirmationCount ?? incrementPendingConfirmationCount ?? 0,
         cancelledCount: cancelledCount ?? incrementCancelledCount ?? 0,
         uniqueUsers: uniqueUsers ?? incrementUniqueUsers ?? 0,
         OwnerId
      }
   });
}

export async function deletePropertyPerformanceSummary (
   ownerId: string,
   propertyId: string,
   periodType: string,
   periodKey: string
): Promise<PropertyPerformanceSummary> {
   // Verify ownership before deletion
   const propertyCheck = await prisma.property.findUnique({
      where: {
         id: propertyId,
         OwnerId: ownerId
      },
      select: {
         id: true
      }
   });

   if (!propertyCheck) {
      throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
   }

   return await prisma.propertyPerformanceSummary.delete({
      where: {
         propertyId_periodType_periodKey: {
            propertyId,
            periodType,
            periodKey
         }
      }
   });
}
