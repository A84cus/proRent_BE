import { z } from "zod";
import { Status, PaymentType } from "@prisma/client";

// Reservation validation schemas
export const reservationCreateSchema = z
  .object({
    propertyId: z.string().uuid("Invalid property ID format"),
    roomTypeId: z.string().uuid("Invalid room type ID format"),
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
    paymentType: z.nativeEnum(PaymentType, { message: "Invalid payment type" }),
    payerEmail: z.string().email("Invalid payer email format").optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["startDate"],
  })
  .refine((data) => new Date(data.startDate) >= new Date(), {
    message: "Start date must be in the future",
    path: ["startDate"],
  });

export const reservationUpdateSchema = z
  .object({
    startDate: z.string().datetime("Invalid start date format").optional(),
    endDate: z.string().datetime("Invalid end date format").optional(),
    orderStatus: z
      .nativeEnum(Status, { message: "Invalid order status" })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["startDate"],
    }
  );

export const reservationQuerySchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  propertyId: z.string().uuid("Invalid property ID format").optional(),
  userId: z.string().uuid("Invalid user ID format").optional(),
  orderStatus: z
    .nativeEnum(Status, { message: "Invalid order status" })
    .optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  sortBy: z
    .enum(["createdAt", "startDate", "endDate", "amount"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const availabilityCheckSchema = z
  .object({
    roomTypeId: z.string().uuid("Invalid room type ID format"),
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["startDate"],
  })
  .refine((data) => new Date(data.startDate) >= new Date(), {
    message: "Start date must be in the future",
    path: ["startDate"],
  });

// Payment validation schemas
export const paymentCreateSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation ID format"),
  amount: z.number().min(0, "Amount must be non-negative"),
  method: z.nativeEnum(PaymentType, { message: "Invalid payment method" }),
  payerEmail: z.string().email("Invalid payer email format"),
});

export const paymentUpdateSchema = z.object({
  paymentStatus: z
    .nativeEnum(Status, { message: "Invalid payment status" })
    .optional(),
  xenditInvoiceId: z.string().optional(),
  paidAt: z.string().datetime("Invalid paid at date format").optional(),
});

// Types
export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
export type ReservationQueryInput = z.infer<typeof reservationQuerySchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

// Reservation validation functions
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { isValid: boolean; error?: string } {
  if (startDate >= endDate) {
    return {
      isValid: false,
      error: "Start date must be before end date",
    };
  }

  const now = new Date();
  if (startDate < now) {
    return {
      isValid: false,
      error: "Start date must be in the future",
    };
  }

  return { isValid: true };
}

export function validateReservationDuration(
  startDate: Date,
  endDate: Date,
  minDays: number = 1,
  maxDays: number = 365
): { isValid: boolean; error?: string } {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < minDays) {
    return {
      isValid: false,
      error: `Reservation must be at least ${minDays} day(s)`,
    };
  }

  if (diffDays > maxDays) {
    return {
      isValid: false,
      error: `Reservation cannot exceed ${maxDays} days`,
    };
  }

  return { isValid: true };
}

export function validateReservationOwnership(
  reservationUserId: string,
  currentUserId: string
): { isValid: boolean; error?: string } {
  if (reservationUserId !== currentUserId) {
    return {
      isValid: false,
      error: "You can only modify your own reservations",
    };
  }

  return { isValid: true };
}

export function validatePaymentAmount(
  amount: number,
  expectedAmount: number,
  tolerance: number = 0.01
): { isValid: boolean; error?: string } {
  if (Math.abs(amount - expectedAmount) > tolerance) {
    return {
      isValid: false,
      error: `Payment amount (${amount}) does not match expected amount (${expectedAmount})`,
    };
  }

  return { isValid: true };
}

export function validateReservationStatus(
  currentStatus: Status,
  newStatus: Status
): { isValid: boolean; error?: string } {
  // Define valid status transitions based on actual Status enum
  const validTransitions: Record<Status, Status[]> = {
    [Status.PENDING_PAYMENT]: [Status.PENDING_CONFIRMATION, Status.CANCELLED],
    [Status.PENDING_CONFIRMATION]: [Status.CONFIRMED, Status.CANCELLED],
    [Status.CONFIRMED]: [Status.CANCELLED],
    [Status.CANCELLED]: [],
  };

  const allowedStatuses = validTransitions[currentStatus] || [];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      isValid: false,
      error: `Cannot change status from ${currentStatus} to ${newStatus}`,
    };
  }

  return { isValid: true };
}
