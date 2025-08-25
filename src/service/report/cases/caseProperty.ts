// src/services/report/dashboard/cases/case2_withProperty.ts
import prisma from '../../../prisma';
import { DashboardContext } from '../../../interfaces/report/reportCustomInterface';
import { getReservationReport } from '../customReportService';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
import { upsertRoomTypePerformanceSummary } from '../roomTypeSummaryService';
import * as availabilityService from '../../reservationService/availabilityService';

export async function handleCase2 (context: DashboardContext): Promise<ReportInterface.DashboardReportResponse> {
   const { ownerId, filters, options, period, periodConfig } = context;
   const { propertyId } = filters;
   const { page = 1, pageSize = 20 } = options;

   const property = await prisma.property.findUnique({
      where: { id: propertyId, OwnerId: ownerId },
      select: {
         id: true,
         name: true,
         mainPicture: true,
         location: { select: { address: true, city: { select: { name: true } } } }
      }
   });

   if (!property) {
      throw new Error(`Property ${propertyId} not found or not owned by owner.`);
   }

   const totalCount = await prisma.roomType.count({ where: { propertyId } });
   const totalPages = Math.ceil(totalCount / pageSize);
   const skip = (page - 1) * pageSize;

   const roomTypes = await prisma.roomType.findMany({
      where: { propertyId },
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
   });

   const propertyReport = await getReservationReport({ ownerId, propertyId, ...filters }, { page: 1, pageSize: 1000 });

   const roomTypeSummaries: ReportInterface.RoomTypeWithAvailability[] = await Promise.all(
      roomTypes.map(async rt => {
         const report = await getReservationReport(
            { ownerId, propertyId, roomTypeId: rt.id, ...filters },
            { page: 1, pageSize: 1000 }
         );

         await upsertRoomTypePerformanceSummary({
            roomTypeId: rt.id,
            propertyId,
            ...periodConfig,
            totalRevenue: report.summary.revenue.actual,
            projectedRevenue: report.summary.revenue.projected,
            totalReservations: report.summary.totalReservations,
            totalNightsBooked: 0,
            confirmedCount: report.summary.counts.CONFIRMED,
            pendingPaymentCount: report.summary.counts.PENDING_PAYMENT,
            pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION,
            cancelledCount: report.summary.counts.CANCELLED,
            uniqueUsers: new Set(report.data.map(r => r.userId)).size,
            OwnerId: ownerId
         });

         const totalQuantity = await availabilityService.getRoomTypeTotalQuantity(rt.id);
         const availabilityRecords = await availabilityService.getActualAvailabilityRecords(
            rt.id,
            filters.startDate,
            filters.endDate
         );

         const availability = availabilityRecords.map(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            return {
               date: dateKey,
               available: record.availableCount,
               isAvailable: record.availableCount > 0
            };
         });

         return {
            roomType: { id: rt.id, name: rt.name },
            counts: report.summary.counts,
            revenue: report.summary.revenue,
            availability: { totalQuantity, dates: availability }
         };
      })
   );

   return {
      properties: [
         {
            property: {
               id: property.id,
               name: property.name,
               Picture: property.mainPicture?.url ?? null,
               address: property.location?.address ?? null,
               city: property.location?.city.name ?? null
            },
            period,
            summary: propertyReport.summary,
            roomTypes: roomTypeSummaries
         }
      ],
      summary: propertyReport.summary,
      period,
      pagination: { page, pageSize, total: totalCount, totalPages }
   };
}
