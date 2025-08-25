import { Status } from '@prisma/client';

// --- Types ---
export interface PropertyMin {
   id: string;
   name: string;
   Picture: string | null;
   address: string | null;
   city: string | null;
}

export interface RoomTypeMin {
   id: string;
   name: string;
}

export interface CustomerMin {
   id: string;
   email: string;
   firstName: string | null;
   lastName: string | null;
}

export interface StatusCounts {
   PENDING_PAYMENT: number;
   PENDING_CONFIRMATION: number;
   CONFIRMED: number;
   CANCELLED: number;
}

export interface RevenueSummary {
   actual: number;
   projected: number;
   average: number;
}

export interface PeriodDetail {
   startDate: Date | null;
   endDate: Date | null;
}

// --- Response Types ---
export interface RoomTypeWithAvailability {
   roomType: RoomTypeMin;
   counts: StatusCounts;
   revenue: RevenueSummary;
   availability: {
      totalQuantity: number;
      dates: Array<{
         date: string; // ISO date string: "2025-01-01"
         available: number;
         isAvailable: boolean;
      }>;
   };
}

export interface PropertySummary {
   property: PropertyMin;
   period: PeriodDetail;
   summary: {
      counts: StatusCounts;
      revenue: RevenueSummary;
   };

   // Only when propertyId is provided
   roomTypes?: RoomTypeWithAvailability[];

   // Only when propertyId+roomTypeId
   uniqueCustomers?: CustomerMin[];
   data?: any[]; // Will be filled only in Case 3
   pagination?: any; // Will be filled only in Case 3
}

export interface DashboardReportResponse {
   properties: PropertySummary[];
   summary: {
      // Combined summary across all filtered data
      counts: StatusCounts;
      revenue: RevenueSummary;
   };
   period: PeriodDetail;
   pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
   };
}

export type ReservationStatus = Status;

export interface ReservationReportItem {
   id: string;
   userId: string;
   propertyId: string;
   roomTypeId: string;
   startDate: Date;
   endDate: Date;
   orderStatus: ReservationStatus;
   paymentAmount: number | null;
   paidAt: Date | null;
   createdAt: Date;
   user: {
      id: string;
      email: string;
      profile: {
         firstName: string | null;
         lastName: string | null;
      };
   };
   property: {
      id: string;
      name: string;
   };
   roomType: {
      id: string;
      name: string;
   };
}

export interface ReservationReportSummary {
   counts: {
      PENDING_PAYMENT: number;
      PENDING_CONFIRMATION: number;
      CONFIRMED: number;
      CANCELLED: number;
   };
   revenue: {
      actual: number; // CONFIRMED only
      projected: number; // All non-CANCELLED
      average: number;
   };
   totalReservations: number;
}

export interface ReservationReportResponse {
   data: ReservationReportItem[];
   summary: ReservationReportSummary;
   pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
   };
}

// --- Input Params ---
export interface ReservationReportFilters {
   propertyId?: string;
   roomTypeId?: string;
   ownerId: string;
   startDate?: Date;
   endDate?: Date;
   status?: ReservationStatus[];
   search?: string; // Search by user email/name
}

export interface ReservationReportOptions {
   page?: number;
   pageSize?: number;
   sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'paymentAmount';
   sortDir?: 'asc' | 'desc';
}

export type PeriodConfig = {
   periodType: 'YEAR' | 'MONTH' | 'CUSTOM';
   periodKey: string;
   year: number;
   month: number | null;
};

export type DashboardContext = {
   ownerId: string;
   filters: Omit<ReservationReportFilters, 'ownerId'>;
   options: ReservationReportOptions;
   period: PeriodDetail;
   periodConfig: PeriodConfig;
};
