// src/services/report/dashboard/cases/case1_noProperty.ts
import prisma from '../../../prisma';
import { DashboardContext } from '../../../interfaces/report/reportCustomInterface';
import { aggregateSummaries } from '../utils/aggregateSummaries';
import { upsertPropertyPerformanceSummary } from '../PerformanceSummaryService';
import { getReservationReport } from '../customReportService';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export async function handleCase1 (context: DashboardContext): Promise<ReportInterface.DashboardReportResponse> {
   const { ownerId, filters, options, period, periodConfig } = context;
   const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options; // Extract sorting options
   const { search } = filters; // Extract search filter
   const { periodType, periodKey, year, month } = periodConfig;

   // --- Map sortBy option to PropertyPerformanceSummary field ---
   let summaryOrderByClause: any = { property: { name: sortDir } }; // Default fallback
   switch (sortBy) {
      case 'paymentAmount':
         summaryOrderByClause = { totalRevenue: sortDir }; // Sort by cached revenue
         break;
      case 'startDate':
      case 'endDate':
      case 'createdAt':
         console.warn(
            `Sorting by ${sortBy} not directly supported on PropertyPerformanceSummary. Falling back to name.`
         );
         summaryOrderByClause = { property: { name: sortDir } };
         break;
      default:
         summaryOrderByClause = { property: { name: sortDir } }; // Default to name
   }

   const propertySearchFilter: any = {
      property: { OwnerId: ownerId },
      periodType,
      periodKey
   };
   if (search) {
      propertySearchFilter.property.name = {
         contains: search,
         mode: 'insensitive' // Case-insensitive search
      };
   }

   const cachedSummaries = await prisma.propertyPerformanceSummary.findMany({
      where: propertySearchFilter,
      include: {
         property: {
            select: {
               id: true,
               name: true,
               mainPicture: true,
               location: { select: { address: true, city: { select: { name: true } } } }
            }
         }
      },
      orderBy: summaryOrderByClause,
      skip: (page - 1) * pageSize,
      take: pageSize
   });

   if (cachedSummaries.length > 0) {
      const properties = cachedSummaries.map(s => ({
         property: {
            id: s.property.id,
            name: s.property.name,
            Picture: s.property.mainPicture?.url ?? null,
            address: s.property.location?.address ?? null,
            city: s.property.location?.city.name ?? null
         },
         period,
         summary: {
            counts: {
               PENDING_PAYMENT: s.pendingPaymentCount,
               PENDING_CONFIRMATION: s.pendingConfirmationCount,
               CONFIRMED: s.confirmedCount,
               CANCELLED: s.cancelledCount
            },
            revenue: {
               actual: Number(s.totalRevenue),
               projected: Number(s.projectedRevenue),
               average: s.confirmedCount > 0 ? Number(s.totalRevenue) / s.confirmedCount : 0
            }
         }
      }));

      const totalCount = await prisma.propertyPerformanceSummary.count({
         where: propertySearchFilter
      });
      const totalPages = Math.ceil(totalCount / pageSize);

      const combined = aggregateSummaries(properties.map(p => p.summary));

      return {
         properties,
         summary: combined,
         period,
         pagination: { page, pageSize, total: totalCount, totalPages }
      };
   }

   const propertyBaseFilter: any = { OwnerId: ownerId };
   if (search) {
      propertyBaseFilter.name = {
         contains: search,
         mode: 'insensitive'
      };
   }

   const totalCount = await prisma.property.count({
      where: propertyBaseFilter
   });
   const totalPages = Math.ceil(totalCount / pageSize);
   const skip = (page - 1) * pageSize;

   const properties = await prisma.property.findMany({
      where: propertyBaseFilter,
      skip,
      take: pageSize,
      orderBy: { name: 'asc' }, // Basic sorting on cache miss, could be improved
      select: {
         id: true,
         name: true,
         mainPicture: true,
         location: { select: { address: true, city: { select: { name: true } } } }
      }
   });

   const propertySummaries = await Promise.all(
      properties.map(async prop => {
         const report = await getReservationReport(
            { ownerId, propertyId: prop.id, ...filters },
            { page: 1, pageSize: 1000 }
         );
         await upsertPropertyPerformanceSummary({
            propertyId: prop.id,
            ...periodConfig,
            totalRevenue: report.summary.revenue.actual,
            projectedRevenue: report.summary.revenue.projected,
            totalReservations: report.summary.totalReservations,
            confirmedCount: report.summary.counts.CONFIRMED,
            pendingPaymentCount: report.summary.counts.PENDING_PAYMENT,
            pendingConfirmationCount: report.summary.counts.PENDING_CONFIRMATION,
            cancelledCount: report.summary.counts.CANCELLED,
            uniqueUsers: new Set(report.data.map(r => r.userId)).size,
            OwnerId: ownerId
         });
         return {
            property: {
               id: prop.id,
               name: prop.name,
               Picture: prop.mainPicture?.url ?? null,
               address: prop.location?.address ?? null,
               city: prop.location?.city.name ?? null
            },
            period,
            summary: report.summary
         };
      })
   );

   const combined = aggregateSummaries(propertySummaries.map(p => p.summary));
   return {
      properties: propertySummaries,
      summary: combined,
      period,
      pagination: { page, pageSize, total: totalCount, totalPages }
   };
}
