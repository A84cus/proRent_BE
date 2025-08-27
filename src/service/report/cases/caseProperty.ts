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
   const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
   const { search } = filters;

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

   // --- Build search filter for RoomTypePerformanceSummary query ---
   const roomTypeSearchFilter: any = {
      propertyId,
      periodType: periodConfig.periodType,
      periodKey: periodConfig.periodKey
   };
   if (search) {
      roomTypeSearchFilter.roomType = {
         name: { contains: search, mode: 'insensitive' }
      };
   }

   // Try cache for room type summaries
   const cachedRoomTypeSummaries = await prisma.roomTypePerformanceSummary.findMany({
      where: roomTypeSearchFilter,
      include: {
         roomType: {
            select: {
               id: true,
               name: true
            }
         }
      },
      orderBy: getSummaryOrderByClause(sortBy, sortDir),
      skip: (page - 1) * pageSize,
      take: pageSize
   });

   const totalCount = await prisma.roomTypePerformanceSummary.count({
      where: roomTypeSearchFilter
   });
   const totalPages = Math.ceil(totalCount / pageSize);

   const roomTypeSummaries: ReportInterface.RoomTypeWithAvailability[] = await Promise.all(
      cachedRoomTypeSummaries.map(async summary => {
         const report = await getReservationReport(
            { ownerId, propertyId, roomTypeId: summary.roomTypeId, ...filters },
            { page: 1, pageSize: 1000 } // Fetch all reservations for this room type
         );

         const customerMap = new Map<string, ReportInterface.CustomerMin>();
         for (const item of report.data) {
            customerMap.set(item.user.id, {
               id: item.user.id,
               email: item.user.email,
               firstName: item.user.profile.firstName,
               lastName: item.user.profile.lastName
            });
         }

         const totalQuantity = await availabilityService.getRoomTypeTotalQuantity(summary.roomTypeId);
         const availabilityRecords = await availabilityService.getActualAvailabilityRecords(
            summary.roomTypeId,
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
            roomType: { id: summary.roomTypeId, name: summary.roomType.name },
            counts: {
               PENDING_PAYMENT: summary.pendingPaymentCount,
               PENDING_CONFIRMATION: summary.pendingConfirmationCount,
               CONFIRMED: summary.confirmedCount,
               CANCELLED: summary.cancelledCount
            },
            revenue: {
               actual: Number(summary.totalRevenue),
               projected: Number(summary.projectedRevenue),
               average: summary.confirmedCount > 0 ? Number(summary.totalRevenue) / summary.confirmedCount : 0
            },
            availability: { totalQuantity, dates: availability },
            data: report.data.map(item => ({
               id: item.id,
               userId: item.userId,
               startDate: item.startDate,
               endDate: item.endDate,
               orderStatus: item.orderStatus,
               paymentAmount: item.paymentAmount,
               user: {
                  email: item.user.email,
                  firstName: item.user.profile.firstName,
                  lastName: item.user.profile.lastName
               }
            })),
            uniqueCustomers: Array.from(customerMap.values())
         };
      })
   );

   const propertySummaryData = {
      counts: {
         PENDING_PAYMENT: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.PENDING_PAYMENT, 0),
         PENDING_CONFIRMATION: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.PENDING_CONFIRMATION, 0),
         CONFIRMED: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.CONFIRMED, 0),
         CANCELLED: roomTypeSummaries.reduce((sum, rt) => sum + rt.counts.CANCELLED, 0)
      },
      revenue: {
         actual: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.actual, 0),
         projected: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.projected, 0),
         average: roomTypeSummaries.reduce((sum, rt) => sum + rt.revenue.average, 0) / roomTypeSummaries.length || 0
      }
   };

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
            summary: propertySummaryData,
            roomTypes: roomTypeSummaries
         }
      ],
      summary: propertySummaryData,
      period,
      pagination: { page, pageSize, total: totalCount, totalPages }
   };
}

function getSummaryOrderByClause (sortBy: string, sortDir: 'asc' | 'desc') {
   switch (sortBy) {
      case 'paymentAmount':
         return { totalRevenue: sortDir };
      case 'roomTypeName':
         return { roomType: { name: sortDir } };
      default:
         return { roomType: { name: sortDir } };
   }
}
