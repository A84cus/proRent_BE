import { Decimal } from '@prisma/client/runtime/library';

export interface RoomTypeSalesItem {
   roomTypeId: string;
   roomTypeName: string;
   propertyId: string;
   propertyName: string;
   totalSales: Decimal;
   transactionCount: number;
   uniqueUsers: number;
}

export interface SalesReportItem {
   propertyId: string;
   propertyName: string;
   totalSales: Decimal; // Use Decimal for monetary values from Prisma
   transactionCount: number;
   uniqueUsers: number; // Assuming you want unique users who booked
}

export interface SalesReportFilters {
   ownerId: string; // Owner requesting the report
   startDate?: Date;
   endDate?: Date;
   sortBy?: 'date' | 'totalSales';
}

export interface TimeSeriesDataPoint {
   period: string; // e.g., '2023-10', '2023-10-15', '2023-Q4'
   totalSales: Decimal;
   transactionCount: number;
}

export interface DatePart {
   year?: boolean;
   month?: boolean;
   day?: boolean;
}

export interface SelectDatePart {
   createdAt: DatePart;
}

export enum ReservationScalarFieldEnum {
   year,
   month,
   day
}

export interface PropertyReportItem {
   propertyId: string;
   propertyName: string;
   roomTypes: RoomTypeReportItem[];
}

export interface RoomTypeReportItem {
   roomTypeId: string;
   roomTypeName: string;
   totalQuantity: number;
   // Availability data will be added later based on date range
   // e.g., availability: { date: string; availableCount: number }[]
}

export interface PropertyReportFilters {
   ownerId: string;
   startDate: Date; // Required for availability
   endDate: Date; // Required for availability
}

export interface MostReservedMonthResult {
   yearMonth: string; // e.g., "2023-10"
   reservationCount: number;
}

export interface ReservationOccupancyData {
   date: Date;
   occupiedCount: number; // Number of confirmed reservations overlapping this date
}
