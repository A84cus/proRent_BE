// src/services/report/reservationReportService.ts

import { Status } from '@prisma/client';
import prisma from '../../prisma';
import { validatePropertyOwnership, validateRoomTypeOwnership } from './cronJob/cronjobValidationService';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';

/**
 * Response type for getReservationReport
 * Used internally by handleUnifiedReport and caching
 */
export interface SimpleReservationResponse {
   data: ReportInterface.ReservationListItem[];
   summary: ReportInterface.ReservationReportSummary;
   pagination: ReportInterface.Pagination;
}

// --- Main Function ---
export async function getReservationReport (
   filters: ReportInterface.ReportFilters,
   options: ReportInterface.ReportOptions = {}
): Promise<SimpleReservationResponse> {
   const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
   const skip = (page - 1) * pageSize;

   // 🔐 Ownership validation
   if (filters.propertyId) {
      await validatePropertyOwnership(filters.ownerId, filters.propertyId);
   }
   if (filters.roomTypeId && filters.propertyId) {
      await validateRoomTypeOwnership(filters.ownerId, filters.roomTypeId);
   }

   // 🔹 Build WHERE clause
   const where: any = {
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId }),
      ...(filters.startDate && { startDate: { lte: filters.endDate || new Date() } }),
      ...(filters.endDate && { endDate: { gte: filters.startDate || new Date('1970-01-01') } }),
      ...(filters.reservationStatus && { orderStatus: filters.reservationStatus })
   };

   // 🔍 Text search
   if (filters.customerName || filters.email || filters.invoiceNumber) {
      where.OR = [];

      if (filters.customerName) {
         where.OR.push(
            { User: { profile: { firstName: { contains: filters.customerName, mode: 'insensitive' } } } },
            { User: { profile: { lastName: { contains: filters.customerName, mode: 'insensitive' } } } }
         );
      }

      if (filters.email) {
         where.OR.push({
            User: { email: { contains: filters.email, mode: 'insensitive' } }
         });
      }

      if (filters.invoiceNumber) {
         where.OR.push({
            payment: { invoiceNumber: { equals: filters.invoiceNumber, mode: 'insensitive' } }
         });
      }
   }

   // 🔢 Count total
   const total = await prisma.reservation.count({ where });

   // 📥 Fetch data
   const reservations = await prisma.reservation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: getOrderBy(sortBy, sortDir),
      include: {
         User: {
            include: {
               profile: true
            }
         },
         payment: {
            select: {
               invoiceNumber: true,
               amount: true
            }
         }
      }
   });

   // 🔄 Map to ReservationListItem
   const data: ReportInterface.ReservationListItem[] = reservations.map(r => ({
      id: r.id,
      userId: r.userId,
      roomId: r.roomId,
      startDate: r.startDate,
      endDate: r.endDate,
      orderStatus: r.orderStatus,
      paymentAmount: r.payment?.amount ?? 0, // number, not null
      invoiceNumber: r.payment?.invoiceNumber ?? null,
      user: {
         email: r.User.email,
         firstName: r.User.profile?.firstName || null,
         lastName: r.User.profile?.lastName || null
      }
   }));

   // 📊 Compute summary
   const summary = await computeSummary(filters);

   return {
      data,
      summary,
      pagination: {
         page,
         pageSize,
         total,
         totalPages: Math.ceil(total / pageSize)
      }
   };
}

// --- Sorting Logic ---
function getOrderBy (sortBy: string, sortDir: 'asc' | 'desc') {
   switch (sortBy) {
      case 'paymentAmount':
         return { payment: { amount: sortDir } };
      case 'createdAt':
         return { createdAt: sortDir };
      case 'startDate':
         return { startDate: sortDir };
      case 'endDate':
         return { endDate: sortDir };
      case 'invoiceNumber':
         return { payment: { invoiceNumber: sortDir } };
      default:
         return { startDate: sortDir };
   }
}

// --- Summary Calculation ---
async function computeSummary (
   filters: ReportInterface.ReportFilters
): Promise<ReportInterface.ReservationReportSummary> {
   const baseWhere: any = {
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId }),
      ...(filters.startDate && { startDate: { lte: filters.endDate || new Date() } }),
      ...(filters.endDate && { endDate: { gte: filters.startDate || new Date('1970-01-01') } })
   };

   const [ pendingPayment, pendingConfirmation, confirmed, cancelled ] = await Promise.all([
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'PENDING_PAYMENT',
            payment: { amount: { gt: 0 } }
         },
         select: { payment: { select: { amount: true } } }
      }),
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'PENDING_CONFIRMATION',
            payment: { amount: { gt: 0 } }
         },
         select: { payment: { select: { amount: true } } }
      }),
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'CONFIRMED',
            payment: { amount: { gt: 0 } }
         },
         select: { payment: { select: { amount: true } } }
      }),
      prisma.reservation.count({
         where: {
            ...baseWhere,
            orderStatus: 'CANCELLED'
         }
      })
   ]);

   const sumRevenue = (reservations: { payment: { amount: number } | null }[]) =>
      reservations.reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

   const actualRevenue = sumRevenue(confirmed);
   const projectedRevenue = sumRevenue(pendingPayment) + sumRevenue(pendingConfirmation) + actualRevenue;

   return {
      counts: {
         PENDING_PAYMENT: pendingPayment.length,
         PENDING_CONFIRMATION: pendingConfirmation.length,
         CONFIRMED: confirmed.length,
         CANCELLED: cancelled
      },
      revenue: {
         actual: actualRevenue,
         projected: projectedRevenue,
         average: confirmed.length > 0 ? actualRevenue / confirmed.length : 0
      },
      totalReservations: pendingPayment.length + pendingConfirmation.length + confirmed.length + cancelled
   };
}
