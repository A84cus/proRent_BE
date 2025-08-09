import { Status } from '@prisma/client';

export interface QueryOptions {
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
