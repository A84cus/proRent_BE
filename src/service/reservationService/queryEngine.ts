// services/reservationQueryBuilder.ts
import { Status } from '@prisma/client';

interface QueryOptions {
   userId?: string;
   propertyOwnerId?: string;
   propertyId?: string;
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
   const { userId, propertyOwnerId, propertyId, filters = {} } = options;
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
         { user: { name: { contains: search, mode: 'insensitive' } } },
         { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
   };
}

function buildAmountFilter (minAmount?: number, maxAmount?: number) {
   const amountConditions: any = {};

   if (minAmount || maxAmount) {
      if (minAmount) {
         amountConditions.amount = { ...amountConditions.amount, gte: minAmount };
      }
      if (maxAmount) {
         amountConditions.amount = { ...amountConditions.amount, lte: maxAmount };
      }

      return { payments: amountConditions };
   }

   return {};
}

export function buildOrderByClause (
   sortBy: 'createdAt' | 'startDate' | 'endDate' | 'totalAmount' | 'reservationNumber',
   sortOrder: 'asc' | 'desc'
): any {
   const orderBy: any = {};

   switch (sortBy) {
      case 'reservationNumber':
         orderBy.id = sortOrder;
         break;
      case 'startDate':
         orderBy.startDate = sortOrder;
         break;
      case 'endDate':
         orderBy.endDate = sortOrder;
         break;
      case 'totalAmount':
         orderBy.payments = { _count: sortOrder };
         break;
      default:
         orderBy[sortBy] = sortOrder;
   }

   return [ orderBy ];
}

export function buildIncludeFields (propertyOwnerId?: string, propertyId?: string) {
   const includeFields: any = {
      RoomType: buildRoomTypeInclude(propertyOwnerId),
      payment: buildPaymentsInclude()
   };

   if (propertyOwnerId || propertyId) {
      includeFields.User = buildUserInclude();
   }

   return includeFields;
}

function buildRoomTypeInclude (propertyOwnerId?: string) {
   return {
      select: {
         name: true,
         basePrice: true,
         property: {
            select: {
               id: true,
               name: true,
               location: true,
               ...(propertyOwnerId && { OwnerId: true })
            }
         }
      }
   };
}

function buildPaymentsInclude () {
   return {
      select: {
         id: true,
         invoiceNumber: true,
         amount: true,
         method: true,
         paymentStatus: true,
         createdAt: true
      }
   };
}

function buildUserInclude () {
   return {
      select: {
         id: true,
         profile: {
            select: {
               firstName: true,
               lastName: true,
               phone: true
            }
         },
         email: true
      }
   };
}
