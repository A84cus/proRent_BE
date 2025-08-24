import { JobStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface UpsertPropertyPerformanceSummaryInput {
   propertyId: string;
   periodType: string;
   periodKey: string;
   year: number;
   month?: number | null;
   // Revenue
   incrementTotalRevenue?: Decimal | number;
   totalRevenue?: Decimal | number;
   // Projected Revenue (PENDING + CONFIRMED)
   incrementProjectedRevenue?: Decimal | number;
   projectedRevenue?: Decimal | number;
   // Reservations
   incrementTotalReservations?: number;
   totalReservations?: number;
   // Status counts
   incrementConfirmedCount?: number;
   confirmedCount?: number;
   incrementPendingPaymentCount?: number;
   pendingPaymentCount?: number;
   incrementPendingConfirmationCount?: number;
   pendingConfirmationCount?: number;
   incrementCancelledCount?: number;
   cancelledCount?: number;
   // Unique users
   incrementUniqueUsers?: number;
   uniqueUsers?: number;
   // Owner
   OwnerId: string;
}

export interface UpsertRoomTypePerformanceSummaryInput {
   roomTypeId: string;
   propertyId?: string; // Optional — will be fetched if missing
   periodType: string;
   periodKey: string;
   year: number;
   month?: number | null;
   // Revenue
   incrementTotalRevenue?: Decimal | number;
   totalRevenue?: Decimal | number;
   // Projected Revenue
   incrementProjectedRevenue?: Decimal | number;
   projectedRevenue?: Decimal | number;
   // Reservations
   incrementTotalReservations?: number;
   totalReservations?: number;
   // Status counts
   incrementConfirmedCount?: number;
   confirmedCount?: number;
   incrementPendingPaymentCount?: number;
   pendingPaymentCount?: number;
   incrementPendingConfirmationCount?: number;
   pendingConfirmationCount?: number;
   incrementCancelledCount?: number;
   cancelledCount?: number;
   // Nights booked
   incrementTotalNightsBooked?: number;
   totalNightsBooked?: number;
   // Unique users
   incrementUniqueUsers?: number;
   uniqueUsers?: number;
   // Owner
   OwnerId: string;
}

// Updated interface to include ownerId for filtering
export interface GetPropertyPerformanceSummaryFilters {
   ownerId: string; // Add ownerId for security and filtering
   propertyId?: string;
   propertyIds?: string[]; // For fetching multiple properties
   periodType?: string;
   periodKey?: string;
   year?: number;
   month?: number;
   startDate?: Date; // For range queries on lastUpdated or period
   endDate?: Date;
}

// --- Interfaces for Input/Output ---
export interface CreateBatchJobInput {
   jobType: string;
   targetOwnerId?: string | null;
   targetPeriodType?: string | null;
   targetPeriodKey?: string | null;
   metadata?: Prisma.JsonValue | null;
}

export interface UpdateBatchJobInput {
   jobId: string;
   status?: JobStatus;
   startedAt?: Date | null;
   completedAt?: Date | null;
   errorMessage?: string | null;
   metadata?: Prisma.JsonValue | null; // Consider deep merge if needed
}

export interface FinalizedPeriodParams {
   periodType: string;
   periodKey: string;
   year: number;
   month: number | null;
}

export interface SalesItem {
   id: string;
   name: string;
   revenue: number;
}

export interface PropertyCard {
   id: string;
   name: string;
   address: string;
   mainPictureUrl: string | null;
   totalReserved: number;
   annualRevenue: number;
   highestMonthlyRevenue: number;
   lowestMonthlyRevenue: number;
   avgDailyRevenue: number;
}

export interface RoomTypeCard {
   id: string;
   name: string;
   totalRevenue: number;
   totalReservations: number;
   totalNightsBooked: number;
}

export interface ReportQuery {
   page: number;
   limit: number;
   sortBy: string;
   sortOrder: 'asc' | 'desc';
   filters: {
      year?: number;
      month?: number;
      search?: string;
      status?: string;
      rentalType?: 'WHOLE_PROPERTY' | 'ROOM_BY_ROOM';
   };
}

export const DEFAULT_REPORT_QUERY: ReportQuery = {
   page: 1,
   limit: 10,
   sortBy: 'createdAt',
   sortOrder: 'desc',
   filters: {}
};

export interface PaginationMeta {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

export interface RevenueSummary {
   totalRevenue: number;
   avgDailyRevenue: number;
   avgMonthlyRevenue: number;
   totalReservations: number;
   uniqueUsers: number;
}

export interface TransactionReportParams {
   ownerId: string;
   propertyId?: string;
   roomTypeId?: string;
   startDate: Date;
   endDate: Date;
}

export interface ChartDataPoint {
   label: string; // e.g., "Jan", "2025-08-01"
   actualRevenue: number;
   projectedRevenue: number;
   reservations: number;
}
