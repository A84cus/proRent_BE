// service/report/cases/updatePerformanceCache.ts
import { getReservationReport } from '../customReportService';
import { upsertPropertyPerformanceSummary } from '../PerformanceSummaryService';
import { upsertRoomTypePerformanceSummary } from '../roomTypeSummaryService';
import prisma from '../../../prisma';

const CACHE_TTL_HOURS = 24;

export async function updatePerformanceCache (reservations: any[], ownerId: string, periodConfig: any) {
   const cutoffDate = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
   const propertyIds = [ ...new Set(reservations.map(r => r.propertyId)) ];
   const roomTypeIds = [ ...new Set(reservations.map(r => r.roomTypeId)) ];

   const [ existingPropertySummaries, existingRoomTypeSummaries ] = await Promise.all([
      prisma.propertyPerformanceSummary.findMany({
         where: {
            propertyId: { in: propertyIds },
            periodType: periodConfig.periodType,
            periodKey: periodConfig.periodKey
         },
         select: { propertyId: true, lastUpdated: true }
      }),
      prisma.roomTypePerformanceSummary.findMany({
         where: {
            roomTypeId: { in: roomTypeIds },
            periodType: periodConfig.periodType,
            periodKey: periodConfig.periodKey
         },
         select: { roomTypeId: true, lastUpdated: true }
      })
   ]);

   const propertyMap = new Map(existingPropertySummaries.map(s => [ s.propertyId, s.lastUpdated ]));
   const roomTypeMap = new Map(existingRoomTypeSummaries.map(s => [ s.roomTypeId, s.lastUpdated ]));

   for (const r of reservations) {
      const propertyNeedsUpdate = !propertyMap.has(r.propertyId) || propertyMap.get(r.propertyId)! < cutoffDate;
      const roomTypeNeedsUpdate = !roomTypeMap.has(r.roomTypeId) || roomTypeMap.get(r.roomTypeId)! < cutoffDate;

      if (!propertyNeedsUpdate && !roomTypeNeedsUpdate) {
         continue;
      }

      try {
         const report = await getReservationReport(
            { ownerId, propertyId: r.propertyId, roomTypeId: r.roomTypeId },
            { page: 1, pageSize: 1000 }
         );

         const promises = [];
         if (propertyNeedsUpdate) {
            promises.push(
               upsertPropertyPerformanceSummary({
                  propertyId: r.propertyId,
                  ...periodConfig,
                  totalRevenue: report.summary.revenue.actual,
                  projectedRevenue: report.summary.revenue.projected,
                  totalReservations: report.summary.totalReservations,
                  confirmedCount: report.summary.counts.CONFIRMED,
                  pendingPaymentCount: report.summary.counts.PENDING_PAYMENT,
                  pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION,
                  cancelledCount: report.summary.counts.CANCELLED,
                  uniqueUsers: new Set(report.data.map((r: any) => r.userId)).size,
                  OwnerId: ownerId
               })
            );
         }
         if (roomTypeNeedsUpdate) {
            promises.push(
               upsertRoomTypePerformanceSummary({
                  roomTypeId: r.roomTypeId,
                  propertyId: r.propertyId,
                  ...periodConfig,
                  totalRevenue: report.summary.revenue.actual,
                  projectedRevenue: report.summary.revenue.projected,
                  totalReservations: report.summary.totalReservations,
                  confirmedCount: report.summary.counts.CONFIRMED,
                  pendingPaymentCount: report.summary.counts.PENDING_PAYMENT,
                  pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION,
                  cancelledCount: report.summary.counts.CANCELLED,
                  uniqueUsers: new Set(report.data.map((r: any) => r.userId)).size,
                  OwnerId: ownerId
               })
            );
         }
         await Promise.all(promises);
      } catch (error) {
         console.error(`Cache update failed for property ${r.propertyId}, roomType ${r.roomTypeId}:`, error);
      }
   }
}
