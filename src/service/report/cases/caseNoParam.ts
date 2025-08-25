// src/services/report/dashboard/cases/case1_noProperty.ts

import prisma from '../../../prisma';
import { DashboardContext } from '../../../interfaces/report/reportCustomInterface';
import { aggregateSummaries } from '../utils/aggregateSummaries';
import { upsertPropertyPerformanceSummary } from '../PerformanceSummaryService';
import { getReservationReport } from '../customReportService';
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export async function handleCase1 (context: DashboardContext): Promise<ReportInterface.DashboardReportResponse> {
   const { ownerId, filters, options, period, periodConfig } = context;
   const { page = 1, pageSize = 20 } = options;

   const { periodType, periodKey, year, month } = periodConfig;

   // Try cache
   const cachedSummaries = await prisma.propertyPerformanceSummary.findMany({
      where: { property: { OwnerId: ownerId }, periodType, periodKey },
      include: {
         property: {
            select: {
               id: true,
               name: true,
               mainPicture: true,
               location: { select: { address: true, city: { select: { name: true } } } }
            }
         }
      }
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
      const combined = aggregateSummaries(properties.map(p => p.summary));
      const totalCount = await prisma.property.count({ where: { OwnerId: ownerId } });
      const totalPages = Math.ceil(totalCount / pageSize);

      return { properties, summary: combined, period, pagination: { page, pageSize, total: totalCount, totalPages } };
   }

   // Cache miss
   const totalCount = await prisma.property.count({ where: { OwnerId: ownerId } });
   const totalPages = Math.ceil(totalCount / pageSize);
   const skip = (page - 1) * pageSize;

   const properties = await prisma.property.findMany({
      where: { OwnerId: ownerId },
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
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
