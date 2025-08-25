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
   const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options; // Extract sorting options
   const { search } = filters; // Extract search filter

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

   // --- Map sortBy option to RoomTypePerformanceSummary field ---
   let summaryOrderByClause: any = { roomType: { name: sortDir } }; // Default fallback
   switch (sortBy) {
      case 'paymentAmount':
         summaryOrderByClause = { totalRevenue: sortDir }; // Sort by cached revenue
         break;
      case 'startDate':
      case 'endDate':
      case 'createdAt':
         // Similar logic as above for PropertyPerformanceSummary
         console.warn(
            `Sorting by ${sortBy} not directly supported on RoomTypePerformanceSummary. Falling back to name.`
         );
         summaryOrderByClause = { roomType: { name: sortDir } };
         break;
      default:
         summaryOrderByClause = { roomType: { name: sortDir } }; // Default to name
   }

   // --- Build search filter for RoomTypePerformanceSummary query ---
   const roomTypeSearchFilter: any = {
      propertyId, // Filter by specific property
      periodType: periodConfig.periodType,
      periodKey: periodConfig.periodKey
   };
   if (search) {
      roomTypeSearchFilter.roomType.name = {
         contains: search,
         mode: 'insensitive' // Case-insensitive search
      };
      // Similar to property search, can be extended for other fields if needed.
   }

   // Try cache for room type summaries - Apply sorting and search filtering here
   const cachedRoomTypeSummaries = await prisma.roomTypePerformanceSummary.findMany({
      where: roomTypeSearchFilter,
      include: {
         roomType: {
            select: {
               id: true,
               name: true
               // Add other fields needed for RoomTypeMin if necessary
            }
         }
         // Include property details if needed for the response structure
         // property: { select: { ... } }
      },
      orderBy: summaryOrderByClause, // <-- Use dynamic sorting
      skip: (page - 1) * pageSize,
      take: pageSize
   });

   if (cachedRoomTypeSummaries.length > 0) {
      // Important: Get the total count matching the search criteria for accurate pagination
      const totalCount = await prisma.roomTypePerformanceSummary.count({
         where: roomTypeSearchFilter
      });
      const totalPages = Math.ceil(totalCount / pageSize);

      const roomTypeSummaries: ReportInterface.RoomTypeWithAvailability[] = await Promise.all(
         cachedRoomTypeSummaries.map(async summary => {
            // Fetch availability for each room type (this part is not cached)
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
               availability: { totalQuantity, dates: availability }
            };
         })
      );

      // Aggregate summary for the property level (from cached data)
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
         summary: propertySummaryData, // Or fetch from PropertyPerformanceSummary if needed
         period,
         pagination: { page, pageSize, total: totalCount, totalPages }
      };
   }

   // Cache miss - Proceed with fetching and calculating (less efficient)
   // Note: This path might also need to apply search/sorting if critical.
   const roomTypeBaseFilter: any = { propertyId };
   if (search) {
      roomTypeBaseFilter.name = {
         contains: search,
         mode: 'insensitive'
      };
   }

   const totalCount = await prisma.roomType.count({
      where: roomTypeBaseFilter
   });
   const totalPages = Math.ceil(totalCount / pageSize);
   const skip = (page - 1) * pageSize;

   // On cache miss, fetch room types with search and basic sorting
   const roomTypes = await prisma.roomType.findMany({
      where: roomTypeBaseFilter,
      skip,
      take: pageSize,
      orderBy: { name: 'asc' }, // Basic sorting on cache miss, could be improved
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
            totalNightsBooked: 0, // You might calculate this if needed
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
