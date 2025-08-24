import { Status } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface TimeSeriesDataPoint {
   period: string; // e.g., '2023-10', '2023-10-15', '2023-Q4'
   totalSales: Decimal;
   transactionCount: number;
}

export interface MostReservedMonthResult {
   yearMonth: string; // e.g., "2023-10"
   reservationCount: number;
}

export interface ReservationOccupancyData {
   date: Date;
   occupiedCount: number; // Number of confirmed reservations overlapping this date
}

export interface TransactionReportItem {
   reservationId: string;
   propertyName: string;
   roomTypeName?: string; // Optional if whole property
   userId: string;
   userEmail: string; // Assuming you want user email
   userFullName?: string; // Assuming you fetch user profile name
   startDate: Date;
   endDate: Date;
   orderStatus: Status; // Use Status enum
   totalAmount: number; // Use number for Float from Payment
   createdAt: Date;
   // Add other relevant fields as needed (e.g., payment method if available)
}

export interface UserReservationReportItem {
   userId: string;
   userEmail: string;
   userFullName?: string;
   totalReservations: number;
   totalAmount: Decimal; // Use Decimal for aggregated monetary values
   // You could add more aggregations here if needed (e.g., avg stay length, most booked property type)
}

export interface UserReservationReportFilters {
   startDate?: Date;
   endDate?: Date;
   orderStatuses?: Status[]; // Default can be handled in the service function
}
