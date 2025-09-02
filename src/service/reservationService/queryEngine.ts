// services/reservationQueryBuilder.ts
import { Status } from '@prisma/client';
import {
   buildPaymentProofInclude,
   buildPaymentsInclude,
   buildReviewInclude,
   buildRoomTypeInclude,
   buildUserInclude
} from './buildInclude';

interface QueryOptions {
   userId?: string;
   propertyOwnerId?: string;
   propertyId?: string;
   roomTypeId?: string;
   filters?: {
      status?: Status;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      minAmount?: number;
      maxAmount?: number;
   };
}

export function buildWhereConditions (options: QueryOptions): any {
   const { userId, propertyOwnerId, propertyId, roomTypeId, filters = {} } = options;
   const whereConditions: any = {};
   if (userId) {
      whereConditions.userId = userId;
   }
   if (propertyOwnerId) {
      whereConditions.RoomType = buildPropertyOwnerFilter(propertyOwnerId);
   }
   if (propertyId) {
      whereConditions.propertyId = propertyId;
   }
   if (roomTypeId) {
      whereConditions.roomTypeId = roomTypeId;
   }
   Object.assign(whereConditions, buildStatusFilter(filters.status));
   Object.assign(whereConditions, buildDateRangeFilter(filters.startDate, filters.endDate));
   Object.assign(whereConditions, buildSearchFilter(filters.search));
   Object.assign(whereConditions, buildAmountFilter(filters.minAmount, filters.maxAmount));

   return whereConditions;
}

function buildPropertyOwnerFilter (OwnerId: string) {
   return {
      property: {
         OwnerId
      }
   };
}

function buildStatusFilter (status?: Status) {
   return status ? { orderStatus: status } : {};
}

function buildDateRangeFilter (startDate?: Date, endDate?: Date) {
   if (!startDate && !endDate) {
      return {};
   }

   const conditions: any = { AND: [] };

   if (startDate) {
      conditions.AND.push({
         OR: [ { startDate: { gte: startDate } }, { endDate: { gte: startDate } } ]
      });
   }

   if (endDate) {
      conditions.AND.push({
         OR: [ { startDate: { lte: endDate } }, { endDate: { lte: endDate } } ]
      });
   }

   return conditions;
}

function buildSearchFilter (search?: string) {
   if (!search) {
      return {};
   }

   return {
      OR: [
         { id: { contains: search, mode: 'insensitive' } },
         { roomTypeId: { contains: search, mode: 'insensitive' } },
         { RoomType: { name: { contains: search, mode: 'insensitive' } } },
         { RoomType: { property: { name: { contains: search, mode: 'insensitive' } } } },
         { payment: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
         { User: { email: { contains: search, mode: 'insensitive' } } },
         { User: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
         { User: { profile: { lastName: { contains: search, mode: 'insensitive' } } } }
      ]
   };
}

function buildAmountFilter (minAmount?: number, maxAmount?: number) {
   const amountConditions: any = {};

   if (minAmount !== undefined || maxAmount !== undefined) {
      if (minAmount !== undefined) {
         amountConditions.amount = { ...amountConditions.amount, gte: minAmount };
      }
      if (maxAmount !== undefined) {
         amountConditions.amount = { ...amountConditions.amount, lte: maxAmount };
      }
      return { payment: amountConditions };
   }
   return {};
}

export function buildOrderByClause (
   sortBy:
      | 'createdAt'
      | 'startDate'
      | 'endDate'
      | 'totalAmount'
      | 'reservationNumber'
      | 'invoiceNumber'
      | 'property.name'
      | 'RoomType.name',
   sortOrder: 'asc' | 'desc'
): any {
   const orderBy: any[] = [];
   switch (sortBy) {
      case 'reservationNumber':
         orderBy.push({ id: sortOrder });
         break;
      case 'invoiceNumber':
         orderBy.push({ payment: { invoiceNumber: sortOrder } });
         break;
      case 'property.name':
         orderBy.push({ RoomType: { property: { name: sortOrder } } });
         break;
      case 'RoomType.name':
         orderBy.push({ RoomType: { name: sortOrder } });
         break;
      case 'startDate':
         orderBy.push({ startDate: sortOrder });
         break;
      case 'endDate':
         orderBy.push({ endDate: sortOrder });
         break;
      case 'totalAmount':
         orderBy.push({ payment: { amount: sortOrder } });
         break;
      default:
         orderBy.push({ [sortBy]: sortOrder });
         break;
   }

   return orderBy;
}

export function buildIncludeFields (propertyOwnerId?: string, propertyId?: string) {
   const includeFields: any = {
      RoomType: buildRoomTypeInclude(propertyOwnerId),
      payment: buildPaymentsInclude(),
      PaymentProof: buildPaymentProofInclude(),
      review: buildReviewInclude()
   };

   if (propertyOwnerId || propertyId) {
      includeFields.User = buildUserInclude();
   }

   return includeFields;
}
