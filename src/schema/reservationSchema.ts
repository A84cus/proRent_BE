// schemas/reservationSchema.ts
import { z } from 'zod';
import { PaymentType } from '@prisma/client'; // Make sure this enum is exported correctly

export const createReservationSchema = z
   .object({
      userId: z.string().min(1, 'User ID is required'),
      propertyId: z.string().min(1, 'Property ID is required'),
      roomTypeId: z.string().optional(),
      startDate: z.coerce.date({
         message: 'Start date is required'
      }),
      endDate: z.coerce.date({
         message: 'End date must be after start date'
      }),
      paymentType: z.enum([ PaymentType.MANUAL_TRANSFER, PaymentType.XENDIT ], {
         error: iss => {
            if (iss.code === 'invalid_value') {
               return `invalid type, expected ${iss.expected} but received ${iss.received}`;
            }
         }
      }),
      payerEmail: z.email('Invalid email format').optional() // Optional based on payment type or user data
   })
   .refine(data => new Date(data.startDate) < new Date(data.endDate), {
      message: 'Start date must be before end date',
      path: [ 'endDate' ] // Error will be associated with endDate field
   });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
