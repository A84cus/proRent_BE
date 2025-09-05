// src/interfaces/report/reportCustomInterface.ts
import { Status, PropertyRentalType } from '@prisma/client';

// --- Basic Models (aligned with Prisma) ---
export interface PropertyMin {
   id: string;
   name: string;
   Picture: string | null;
   address: string | null;
   city: string | null;
   province: string | null;
   rentalType: PropertyRentalType;
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
   phone: string | null;
}

// --- Summary Types ---
export interface StatusCounts {
   PENDING_PAYMENT: number;
   PENDING_CONFIRMATION: number;
   CONFIRMED: number;
   CANCELLED: number;
}

export interface RevenueSummary {
   actual: number; // sum of confirmed paymentAmount
   projected: number; // sum of PENDING_payment + PENDING_confirmation
   average: number; // actual / confirmedCount
}

export interface PeriodDetail {
   startDate: Date | null;
   endDate: Date | null;
}

// --- Reservation List Item ---
export interface ReservationListItem {
   id: string;
   userId: string;
   roomId: string | null;
   startDate: Date;
   endDate: Date;
   orderStatus: Status;
   paymentAmount: number;
   invoiceNumber: string | null;
   user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
   };
}

// --- Room Type Full View ---
export interface RoomTypeWithAvailability {
   roomType: RoomTypeMin;
   counts: StatusCounts;
   revenue: RevenueSummary;
   uniqueCustomers: number;
   availability: {
      totalQuantity: number;
      dates: Array<{
         date: string; // ISO date string: "2025-01-01"
         available: number;
         isAvailable: boolean;
      }>;
   };
   reservationListItems: ReservationListItem[];
   pagination: Pagination;
   totalAmount: number;
}

// --- Property Full View ---
export interface PropertySummaryBase {
   property: PropertyMin;
   period: PeriodDetail;
   summary: {
      counts: StatusCounts;
      revenue: RevenueSummary;
      totalRoomTypes: number;
   };
   roomTypes: Array<Omit<RoomTypeWithAvailability, 'reservationListItems' | 'pagination'>>;
}

// The full property summary including reservation details
export interface PropertySummaryWithReservations extends PropertySummary {}

// Update the main PropertySummary to be the full version (as it was)
export interface PropertySummary {
   property: PropertyMin;
   period: PeriodDetail;
   summary: {
      counts: StatusCounts;
      revenue: RevenueSummary;
      totalRoomTypes: number;
   };
   roomTypes: RoomTypeWithAvailability[]; // Includes reservationListItems
}

// --- Dashboard Summary ---
export interface DashboardGlobalSummary {
   totalProperties: number;
   totalActiveBookings: number; // active stays (startDate >= now)
   totalActualRevenue: number;
   totalProjectedRevenue: number;
}

export interface DashboardAggregateSummary {
   counts: StatusCounts;
   revenue: RevenueSummary;
}

export interface DashboardReportResponse {
   properties: PropertySummary[];
   summary: {
      Global: DashboardGlobalSummary;
      Aggregate: DashboardAggregateSummary;
      period: PeriodDetail;
      pagination: Pagination;
   };
}

// --- Pagination ---
export interface Pagination {
   page: number;
   pageSize: number;
   total: number;
   totalPages: number;
}

// --- Filters (aligned with Prisma queries) ---
export interface ReportFilters {
   // 🔹 Property-level filters
   propertyId?: string;
   propertySearch?: string; // Search: property.name, location.address, city.name, province.name
   city?: string;
   province?: string;

   // 🔹 RoomType-level filters
   roomTypeId?: string;
   roomTypeSearch?: string; // Search: roomType.name

   // 🔹 Reservation-level filters
   customerName?: string; // Search: user.profile.firstName, lastName
   email?: string;
   invoiceNumber?: string;
   reservationStatus?: Status;
   startDate?: Date | null;
   endDate?: Date | null;

   // 🔹 Owner context
   ownerId: string;
   search?: string;
}

// --- Options ---
export interface ReportOptions {
   // 🔹 Pagination
   page?: number; // for properties
   pageSize?: number; // default: 10

   reservationPage?: number | { [roomTypeId: string]: number }; // per-room-type page
   reservationPageSize?: number; // default: 10
   fetchAllData?: boolean;

   // 🔹 Sorting
   sortBy?:
      | 'name'
      | 'revenue'
      | 'confirmed'
      | 'pending'
      | 'city'
      | 'address'
      | 'province'
      | 'startDate'
      | 'endDate'
      | 'createdAt'
      | 'paymentAmount';
   sortDir?: 'asc' | 'desc';

   // 🔹 Search
   search?: string; // general search (property, room type, customer)
}

// --- Period Config ---
export type PeriodConfig = {
   periodType: 'YEAR' | 'MONTH' | 'CUSTOM';
   periodKey: string;
   year: number;
   month: number | null;
};

// --- Dashboard Context (Input) ---
export type DashboardContext = {
   ownerId: string;
   filters: Omit<ReportFilters, 'ownerId'>;
   options: ReportOptions;
   period: PeriodDetail;
   periodConfig: PeriodConfig;
};

export interface ReservationReportSummary {
   counts: StatusCounts;
   revenue: {
      actual: number;
      projected: number;
      average: number;
   };
   totalReservations: number;
}
