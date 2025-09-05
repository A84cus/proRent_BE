// src/service/report/transactionReportService.ts
import { RevenueSummary, TransactionReportParams } from '../../interfaces/report/reportDashboardInterface';
import prisma from '../../prisma';
import { smartYearlyRecalculation } from './cronJob/cronjobSubService';

export async function getTransactionRevenueSummary ({
   ownerId,
   propertyId,
   roomTypeId,
   startDate,
   endDate
}: TransactionReportParams): Promise<RevenueSummary> {
   const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
   const year = startDate.getFullYear();

   // 1. Try to get from PropertyPerformanceSummary
   if (propertyId) {
      const summary = await getPropertySummary(propertyId, year, startDate, endDate);
      if (summary) {
         return enhanceWithAverages(summary, durationInDays);
      }
   }

   // 2. Try to get from RoomTypePerformanceSummary
   if (roomTypeId) {
      const summary = await getRoomTypeSummary(roomTypeId, year, startDate, endDate);
      if (summary) {
         return enhanceWithAverages(summary, durationInDays);
      }
   }

   // 3. No summary → trigger recalculation and fallback
   await smartYearlyRecalculation(year);
   const raw = await fallbackCalculateFromReservations(ownerId, propertyId, roomTypeId, startDate, endDate);
   return enhanceWithAverages(raw, durationInDays);
}

// --- Helpers ---

async function getPropertySummary (
   propertyId: string,
   year: number,
   startDate: Date,
   endDate: Date
): Promise<Partial<RevenueSummary> | null> {
   const summary = await prisma.propertyPerformanceSummary.findFirst({
      where: {
         propertyId,
         property: { OwnerId: propertyId },
         year
      }
   });

   if (!summary) {
      return null;
   }

   return {
      totalRevenue: Number(summary.totalRevenue),
      totalReservations: summary.totalReservations,
      uniqueUsers: summary.uniqueUsers
   };
}

async function getRoomTypeSummary (
   roomTypeId: string,
   year: number,
   startDate: Date,
   endDate: Date
): Promise<Partial<RevenueSummary> | null> {
   const summary = await prisma.roomTypePerformanceSummary.findFirst({
      where: {
         roomTypeId,
         property: { OwnerId: roomTypeId }, // Ensure ownership
         year
      }
   });

   if (!summary) {
      return null;
   }

   return {
      totalRevenue: Number(summary.totalRevenue),
      totalReservations: summary.totalReservations,
      uniqueUsers: summary.uniqueUsers
   };
}

async function fallbackCalculateFromReservations (
   ownerId: string,
   propertyId: string | undefined,
   roomTypeId: string | undefined,
   startDate: Date,
   endDate: Date
): Promise<Partial<RevenueSummary>> {
   const where: any = {
      property: { OwnerId: ownerId },
      orderStatus: 'CONFIRMED',
      startDate: { lte: endDate },
      endDate: { gte: startDate }
   };

   if (propertyId) {
      where.propertyId = propertyId;
   }
   if (roomTypeId) {
      where.roomTypeId = roomTypeId;
   }

   const reservations = await prisma.reservation.findMany({
      where,
      include: { payment: true, User: true }
   });

   const totalRevenue = reservations
      .filter(r => r.payment?.paymentStatus === 'CONFIRMED')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

   const totalReservations = reservations.length;
   const uniqueUsers = new Set(reservations.map(r => r.userId)).size;

   return { totalRevenue, totalReservations, uniqueUsers };
}

function enhanceWithAverages (data: Partial<RevenueSummary>, durationInDays: number): RevenueSummary {
   const totalRevenue = data.totalRevenue || 0;
   const avgDailyRevenue = durationInDays > 0 ? totalRevenue / durationInDays : 0;
   const avgMonthlyRevenue = avgDailyRevenue * 30.44; // Average days per month

   return {
      totalRevenue,
      avgDailyRevenue,
      avgMonthlyRevenue,
      totalReservations: data.totalReservations || 0,
      uniqueUsers: data.uniqueUsers || 0
   };
}
