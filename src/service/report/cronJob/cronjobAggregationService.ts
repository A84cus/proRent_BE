// src/services/report/cronJob/cronjobAggregationService.ts
import prisma from '../../../prisma'; // Adjust path
import { Decimal } from '@prisma/client/runtime/library';
import { Status } from '@prisma/client';

// --- Property Aggregation ---

export async function aggregateReservationData (propertyId: string, startDate: Date, endDate: Date) {
   try {
      // --- 1. Find relevant CONFIRMED Reservation IDs based on STAY DATES ---
      const reservations = await prisma.reservation.findMany({
         where: {
            propertyId,
            orderStatus: Status.CONFIRMED,
            startDate: { lte: endDate },
            endDate: { gte: startDate }
         },
         select: {
            id: true
         }
      });

      const reservationIds = reservations.map(r => r.id);
      const totalReservations = reservationIds.length;

      if (totalReservations === 0) {
         return { totalRevenue: new Decimal(0), totalReservations: 0 };
      }

      // --- 3. Aggregate Payments directly for these Reservation IDs ---
      const paymentAggregation = await prisma.payment.aggregate({
         where: {
            reservationId: {
               in: reservationIds
            },
            // Optionally, add payment status check if needed (e.g., only PAID payments contribute to revenue)
            paymentStatus: Status.CONFIRMED
         },
         _sum: {
            amount: true // Sum the payment amount directly
         },
         _count: {
            _all: true // Count the payments
         }
      });

      const rawSumAmount = paymentAggregation._sum?.amount ?? 0;
      const paymentCount = paymentAggregation._count._all;
      const totalRevenue = new Decimal(rawSumAmount);

      return { totalRevenue, totalReservations };
   } catch (error) {
      throw error;
   }
}

export async function fetchUniqueUsers (propertyId: string, startDate: Date, endDate: Date) {
   const userReservations = await prisma.reservation.findMany({
      where: {
         propertyId,
         orderStatus: Status.CONFIRMED,
         startDate: { lte: endDate },
         endDate: { gte: startDate }
      },
      select: {
         userId: true
      }
   });
   return new Set(userReservations.map(r => r.userId)).size;
}

// --- RoomType Aggregation ---
export async function aggregateRoomTypeReservationData (roomTypeId: string, startDate: Date, endDate: Date) {
   try {
      const reservations = await prisma.reservation.findMany({
         where: {
            roomTypeId,
            orderStatus: Status.CONFIRMED,
            startDate: { lte: endDate },
            endDate: { gte: startDate }
         },
         select: {
            id: true,
            startDate: true,
            endDate: true
         }
      });

      const reservationIds = reservations.map(r => r.id);
      const totalReservations = reservationIds.length;

      let totalNightsBooked = 0;
      reservations.forEach(res => {
         const start = new Date(res.startDate);
         const end = new Date(res.endDate);
         const diffTime = Math.max(end.getTime() - start.getTime(), 0);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         totalNightsBooked += diffDays;
      });

      if (totalReservations === 0) {
         return { totalRevenue: new Decimal(0), totalReservations: 0, totalNightsBooked: 0 };
      }

      const paymentAggregation = await prisma.payment.aggregate({
         where: {
            reservationId: {
               in: reservationIds
            },
            paymentStatus: Status.CONFIRMED // Add if needed
         },
         _sum: {
            amount: true
         },
         _count: {
            _all: true
         }
      });

      const rawSumAmount = paymentAggregation._sum?.amount ?? 0;
      const totalRevenue = new Decimal(rawSumAmount);

      return { totalRevenue, totalReservations, totalNightsBooked };
   } catch (error) {
      throw error;
   }
}

export async function fetchRoomTypeUniqueUsers (roomTypeId: string, startDate: Date, endDate: Date) {
   const userReservations = await prisma.reservation.findMany({
      where: {
         roomTypeId,
         orderStatus: Status.CONFIRMED,
         startDate: { lte: endDate },
         endDate: { gte: startDate }
      },
      select: {
         userId: true
      }
   });
   return new Set(userReservations.map(r => r.userId)).size;
}
