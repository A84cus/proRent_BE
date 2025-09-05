// src/services/report/roomTypePerformanceSummaryService.ts
import prisma from '../../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { RoomTypePerformanceSummary } from '@prisma/client';
import { UpsertRoomTypePerformanceSummaryInput } from '../../interfaces/report/reportDashboardInterface';
import { buildSummaryUpdateData } from './utils/buildSummaryData';

// --- Service Functions ---

export async function findRoomTypePerformanceSummary (
   ownerId: string,
   roomTypeId: string,
   periodType: string,
   periodKey: string
): Promise<RoomTypePerformanceSummary | null> {
   // First, verify the room type belongs to a property owned by the owner
   const roomTypeCheck = await prisma.roomType.findUnique({
      where: {
         id: roomTypeId,
         property: {
            OwnerId: ownerId // Check ownership via relation
         }
      },
      select: {
         id: true
      }
   });

   if (!roomTypeCheck) {
      // Room type doesn't exist or doesn't belong to an owner's property
      return null;
   }

   // If ownership is valid, find the summary record
   return await prisma.roomTypePerformanceSummary.findUnique({
      where: {
         roomTypeId_periodType_periodKey: {
            roomTypeId,
            periodType,
            periodKey
         }
      }
   });
}

export async function upsertRoomTypePerformanceSummary (
   data: UpsertRoomTypePerformanceSummaryInput
): Promise<RoomTypePerformanceSummary> {
   const {
      roomTypeId,
      propertyId: inputPropertyId,
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
      incrementTotalNightsBooked,
      totalNightsBooked,
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

   let finalPropertyId = inputPropertyId;
   if (!finalPropertyId) {
      const roomType = await prisma.roomType.findUnique({
         where: { id: roomTypeId },
         select: { propertyId: true }
      });
      if (!roomType) {
         throw new Error(`RoomType with ID ${roomTypeId} not found.`);
      }
      finalPropertyId = roomType.propertyId;
   }

   // --- 🧱 Build update & create data ---
   const { update, create } = buildSummaryUpdateData({
      incrementTotalRevenue,
      totalRevenue,
      incrementProjectedRevenue,
      projectedRevenue,
      incrementTotalReservations,
      totalReservations,
      incrementTotalNightsBooked,
      totalNightsBooked,
      incrementConfirmedCount,
      confirmedCount,
      incrementPendingPaymentCount,
      pendingPaymentCount,
      incrementPendingConfirmationCount,
      pendingConfirmationCount,
      incrementCancelledCount,
      cancelledCount,
      incrementUniqueUsers,
      uniqueUsers
   });

   // --- 💾 Perform upsert ---
   return await prisma.roomTypePerformanceSummary.upsert({
      where: {
         roomTypeId_periodType_periodKey: {
            roomTypeId,
            periodType,
            periodKey
         }
      },
      update,
      create: {
         ...create,
         roomTypeId,
         propertyId: finalPropertyId!,
         periodType,
         periodKey,
         year,
         month: month ?? null,
         OwnerId
      }
   });
}

export async function deleteRoomTypePerformanceSummary (
   ownerId: string,
   roomTypeId: string,
   periodType: string,
   periodKey: string
): Promise<RoomTypePerformanceSummary> {
   // Verify ownership before deletion
   const roomTypeCheck = await prisma.roomType.findUnique({
      where: {
         id: roomTypeId,
         property: {
            OwnerId: ownerId // Check ownership via relation
         }
      },
      select: {
         id: true
      }
   });

   if (!roomTypeCheck) {
      throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
   }

   return await prisma.roomTypePerformanceSummary.delete({
      where: {
         roomTypeId_periodType_periodKey: {
            roomTypeId,
            periodType,
            periodKey
         }
      }
   });
}
