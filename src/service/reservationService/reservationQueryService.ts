// services/reservationService.ts
import prisma from '../../prisma';
import { buildWhereConditions, buildOrderByClause, buildIncludeFields } from './queryEngine';
import { calculatePagination, addTotalAmounts, validateQueryOptions } from './reservationQueryHelper';
import { Status } from '@prisma/client';

interface ReservationQueryOptions {
   userId?: string;
   propertyOwnerId?: string;
   propertyId?: string;
   roomTypeId?: string;
   page?: number;
   limit?: number;
   sortBy?:
      | 'createdAt'
      | 'startDate'
      | 'endDate'
      | 'totalAmount'
      | 'reservationNumber'
      | 'invoiceNumber'
      | 'property.name'
      | 'RoomType.name';
   sortOrder?: 'asc' | 'desc';
   filters?: {
      status?: Status;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      minAmount?: number;
      maxAmount?: number;
   };
}

export async function queryReservations (options: ReservationQueryOptions) {
   const validatedOptions = validateQueryOptions(options);
   const {
      userId,
      propertyOwnerId,
      propertyId,
      roomTypeId,
      page = validatedOptions.page,
      limit = validatedOptions.limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {}
   } = options;

   const skip = (page - 1) * limit;

   const whereConditions = buildWhereConditions({
      userId,
      propertyOwnerId,
      propertyId,
      roomTypeId,
      filters
   });

   const orderBy = buildOrderByClause(sortBy, sortOrder);
   const includeFields = buildIncludeFields(propertyOwnerId, propertyId);

   return await executeReservationQuery(whereConditions, orderBy, includeFields, skip, limit, page, filters);
}

async function executeReservationQuery (
   whereConditions: any,
   orderBy: any,
   includeFields: any,
   skip: number,
   limit: number,
   page: number,
   filters: any
) {
   const [ reservations, totalCount ] = await Promise.all([
      prisma.reservation.findMany({
         where: whereConditions,
         include: includeFields,
         orderBy,
         skip,
         take: limit
      }),
      prisma.reservation.count({
         where: whereConditions
      })
   ]);

   const pagination = calculatePagination(page, limit, totalCount);

   return {
      reservations,
      pagination
   };
}

// Convenience functions
export async function getUserReservations (userId: string, options: Omit<ReservationQueryOptions, 'userId'> = {}) {
   return queryReservations({ userId, ...options });
}

export async function getOwnerReservations (
   propertyOwnerId: string,
   options: Omit<ReservationQueryOptions, 'propertyOwnerId'> = {}
) {
   return queryReservations({ propertyOwnerId, ...options });
}

export async function getPropertyReservations (
   propertyId: string,
   options: Omit<ReservationQueryOptions, 'propertyId'> = {}
) {
   return queryReservations({ propertyId, ...options });
}

export async function getReservationWithPayment (reservationId: string) {
   try {
      const includeFields = buildIncludeFields();

      const reservationWithPayment = await prisma.reservation.findUnique({
         where: {
            id: reservationId
         },
         include: includeFields
      });

      return reservationWithPayment;
   } catch (error) {
      console.error(`Error fetching reservation with payment for ID ${reservationId}:`, error);

      throw error;
   }
}
