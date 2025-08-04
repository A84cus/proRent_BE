"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationSchema = void 0;
// schemas/reservationSchema.ts
const zod_1 = require("zod");
const client_1 = require("@prisma/client"); // Make sure this enum is exported correctly
exports.createReservationSchema = zod_1.z
    .object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    propertyId: zod_1.z.string().min(1, 'Property ID is required'),
    roomTypeId: zod_1.z.string().optional(),
    startDate: zod_1.z.coerce.date({
        message: 'Start date is required'
    }),
    endDate: zod_1.z.coerce.date({
        message: 'End date must be after start date'
    }),
    paymentType: zod_1.z.enum([client_1.PaymentType.MANUAL_TRANSFER, client_1.PaymentType.XENDIT], {
        error: iss => {
            if (iss.code === 'invalid_value') {
                return `invalid type, expected ${iss.expected} but received ${iss.received}`;
            }
        }
    }),
    payerEmail: zod_1.z.email('Invalid email format').optional()
})
    .refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'Start date must be before end date',
    path: ['endDate']
});
