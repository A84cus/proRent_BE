// src/services/report/reservationReportService.ts

import { Status } from '@prisma/client';
import prisma from '../../prisma';
import { validatePropertyOwnership, validateRoomTypeOwnership } from './cronJob/cronjobValidationService';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';

// --- Types ---
type ReservationReportFilters = ReportInterface.ReservationReportFilters;
type ReservationReportOptions = ReportInterface.ReservationReportOptions;
type ReservationReportResponse = ReportInterface.ReservationReportResponse;

// --- Main Function ---
export async function getReservationReport (
   filters: ReservationReportFilters,
   options: ReservationReportOptions = {}
): Promise<ReservationReportResponse> {
   const { page = 1, pageSize = 20, sortBy = 'startDate', sortDir = 'desc' } = options;
   const skip = (page - 1) * pageSize;

   if (filters.propertyId) {
      await validatePropertyOwnership(filters.ownerId, filters.propertyId);
   } else if (filters.roomTypeId) {
      await validateRoomTypeOwnership(filters.ownerId, filters.roomTypeId);
   }

   const where: any = {
      orderStatus: { not: 'CANCELLED' }, // Exclude cancelled by default (include only if requested)
      ...(filters.startDate && { startDate: { lte: filters.endDate || new Date() } }),
      ...(filters.endDate && { endDate: { gte: filters.startDate || new Date('1970') } }),
      ...(filters.status && { orderStatus: { in: filters.status } }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId })
   };

   if (filters.search) {
      where.OR = [
         { User: { email: { contains: filters.search, mode: 'insensitive' } } },
         { User: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
   }

   if (filters.status?.includes('CANCELLED')) {
      delete where.orderStatus;
      where.orderStatus = { in: filters.status };
   }
   const total = await prisma.reservation.count({ where });

   const data = await prisma.reservation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: getOrderBy(sortBy, sortDir),
      select: {
         id: true,
         userId: true,
         propertyId: true,
         roomTypeId: true,
         startDate: true,
         endDate: true,
         orderStatus: true,
         createdAt: true,
         payment: {
            select: {
               amount: true,
               paidAt: true
            }
         },
         User: {
            select: {
               id: true,
               email: true,
               profile: {
                  select: {
                     firstName: true,
                     lastName: true
                  }
               }
            }
         },
         Property: {
            select: {
               id: true,
               name: true
            }
         },
         RoomType: {
            select: {
               id: true,
               name: true
            }
         }
      }
   });

   const mappedData: ReportInterface.ReservationReportItem[] = data.map(r => ({
      id: r.id,
      userId: r.userId,
      propertyId: r.propertyId,
      roomTypeId: r.roomTypeId,
      startDate: r.startDate,
      endDate: r.endDate,
      orderStatus: r.orderStatus,
      paymentAmount: r.payment?.amount ?? null,
      paidAt: r.payment?.paidAt ?? null,
      createdAt: r.createdAt,
      user: {
         id: r.User.id,
         email: r.User.email,
         profile: r.User.profile ?? {
            firstName: null,
            lastName: null
         }
      },
      property: r.Property,
      roomType: r.RoomType
   }));

   const summary = await computeSummary(filters);

   return {
      data: mappedData,
      summary,
      pagination: {
         page,
         pageSize,
         total,
         totalPages: Math.ceil(total / pageSize)
      }
   };
}

function getOrderBy (sortBy: string, sortDir: 'asc' | 'desc') {
   switch (sortBy) {
      case 'paymentAmount':
         return { payment: { amount: sortDir } };
      case 'createdAt':
         return { createdAt: sortDir };
      case 'endDate':
         return { endDate: sortDir };
      default:
         return { startDate: sortDir };
   }
}

async function computeSummary (filters: ReservationReportFilters): Promise<ReportInterface.ReservationReportSummary> {
   const baseWhere: any = {
      ...(filters.startDate && { startDate: { lte: filters.endDate || new Date() } }),
      ...(filters.endDate && { endDate: { gte: filters.startDate || new Date('1970') } }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.roomTypeId && { roomTypeId: filters.roomTypeId })
   };

   const [ pendingPayment, pendingConfirmation, confirmed, cancelled ] = await Promise.all([
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'PENDING_PAYMENT',
            payment: { paymentStatus: 'CONFIRMED' } // Only CONFIRMED ones contribute to revenue
         },
         select: { payment: { select: { amount: true } } }
      }),
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'PENDING_CONFIRMATION',
            payment: { paymentStatus: 'CONFIRMED' }
         },
         select: { payment: { select: { amount: true } } }
      }),
      prisma.reservation.findMany({
         where: {
            ...baseWhere,
            orderStatus: 'CONFIRMED',
            payment: { paymentStatus: 'CONFIRMED' }
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

   const sumRevenue = (reservations: any[]) => reservations.reduce((sum, r) => sum + (r.payment?.amount || 0), 0);
   const avgRevenue = (reservations: any[]) =>
      reservations.reduce((sum, r) => sum + (r.payment?.amount || 0), 0) / reservations.length;

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
         average: avgRevenue(confirmed)
      },
      totalReservations: pendingPayment.length + pendingConfirmation.length + confirmed.length + cancelled
   };
}
