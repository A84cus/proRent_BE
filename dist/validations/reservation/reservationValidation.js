"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentUpdateSchema = exports.paymentCreateSchema = exports.availabilityCheckSchema = exports.reservationQuerySchema = exports.reservationUpdateSchema = exports.reservationCreateSchema = void 0;
exports.validateDateRange = validateDateRange;
exports.validateReservationDuration = validateReservationDuration;
exports.validateReservationOwnership = validateReservationOwnership;
exports.validatePaymentAmount = validatePaymentAmount;
exports.validateReservationStatus = validateReservationStatus;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Reservation validation schemas
exports.reservationCreateSchema = zod_1.z
    .object({
    propertyId: zod_1.z.string().uuid("Invalid property ID format"),
    roomTypeId: zod_1.z.string().uuid("Invalid room type ID format"),
    startDate: zod_1.z.string().datetime("Invalid start date format"),
    endDate: zod_1.z.string().datetime("Invalid end date format"),
    paymentType: zod_1.z.nativeEnum(client_1.PaymentType, { message: "Invalid payment type" }),
    payerEmail: zod_1.z.string().email("Invalid payer email format").optional(),
})
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["startDate"],
})
    .refine((data) => new Date(data.startDate) >= new Date(), {
    message: "Start date must be in the future",
    path: ["startDate"],
});
exports.reservationUpdateSchema = zod_1.z
    .object({
    startDate: zod_1.z.string().datetime("Invalid start date format").optional(),
    endDate: zod_1.z.string().datetime("Invalid end date format").optional(),
    orderStatus: zod_1.z
        .nativeEnum(client_1.Status, { message: "Invalid order status" })
        .optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: "Start date must be before end date",
    path: ["startDate"],
});
exports.reservationQuerySchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1).optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(10).optional(),
    propertyId: zod_1.z.string().uuid("Invalid property ID format").optional(),
    userId: zod_1.z.string().uuid("Invalid user ID format").optional(),
    orderStatus: zod_1.z
        .nativeEnum(client_1.Status, { message: "Invalid order status" })
        .optional(),
    startDate: zod_1.z.string().datetime("Invalid start date format").optional(),
    endDate: zod_1.z.string().datetime("Invalid end date format").optional(),
    sortBy: zod_1.z
        .enum(["createdAt", "startDate", "endDate", "amount"])
        .default("createdAt")
        .optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
exports.availabilityCheckSchema = zod_1.z
    .object({
    roomTypeId: zod_1.z.string().uuid("Invalid room type ID format"),
    startDate: zod_1.z.string().datetime("Invalid start date format"),
    endDate: zod_1.z.string().datetime("Invalid end date format"),
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
exports.paymentCreateSchema = zod_1.z.object({
    reservationId: zod_1.z.string().uuid("Invalid reservation ID format"),
    amount: zod_1.z.number().min(0, "Amount must be non-negative"),
    method: zod_1.z.nativeEnum(client_1.PaymentType, { message: "Invalid payment method" }),
    payerEmail: zod_1.z.string().email("Invalid payer email format"),
});
exports.paymentUpdateSchema = zod_1.z.object({
    paymentStatus: zod_1.z
        .nativeEnum(client_1.Status, { message: "Invalid payment status" })
        .optional(),
    xenditInvoiceId: zod_1.z.string().optional(),
    paidAt: zod_1.z.string().datetime("Invalid paid at date format").optional(),
});
// Reservation validation functions
function validateDateRange(startDate, endDate) {
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
function validateReservationDuration(startDate, endDate, minDays = 1, maxDays = 365) {
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
function validateReservationOwnership(reservationUserId, currentUserId) {
    if (reservationUserId !== currentUserId) {
        return {
            isValid: false,
            error: "You can only modify your own reservations",
        };
    }
    return { isValid: true };
}
function validatePaymentAmount(amount, expectedAmount, tolerance = 0.01) {
    if (Math.abs(amount - expectedAmount) > tolerance) {
        return {
            isValid: false,
            error: `Payment amount (${amount}) does not match expected amount (${expectedAmount})`,
        };
    }
    return { isValid: true };
}
function validateReservationStatus(currentStatus, newStatus) {
    // Define valid status transitions based on actual Status enum
    const validTransitions = {
        [client_1.Status.PENDING_PAYMENT]: [client_1.Status.PENDING_CONFIRMATION, client_1.Status.CANCELLED],
        [client_1.Status.PENDING_CONFIRMATION]: [client_1.Status.CONFIRMED, client_1.Status.CANCELLED],
        [client_1.Status.CONFIRMED]: [client_1.Status.CANCELLED],
        [client_1.Status.CANCELLED]: [],
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
