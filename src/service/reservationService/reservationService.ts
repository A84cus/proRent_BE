// services/createReservation.ts
import prisma from '../../prisma';
import { calculateTotalPrice } from './pricingService';
import { checkAvailability, decrementAvailability } from './availabilityService';
import { resolveTargetRoomTypeId } from './propertyRoomResolver';
import { createReservationSchema } from '../../schema/reservationSchema';
import { Status } from '@prisma/client';

export async function createReservation (input: unknown) {
   const data = validateInput(input);
   // 1. Resolve the correct Room ID using the new service
   //    This encapsulates all the property/room type logic
   const targetRoomTypeId = await resolveTargetRoomTypeId(data.propertyId, data.roomTypeId);

   // 2. Validate availability for the determined target room
   await validateRoomTypeAvailability(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));

   // 3. Calculate price based on the target room
   const totalPrice = await calculateTotalPrice(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));

   // 4. Set expiration time (1 hour as per requirement)
   const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

   // 5. Determine initial order status (Always PENDING_PAYMENT upon creation)
   const initialOrderStatus: Status = Status.PENDING_PAYMENT;

   // 6. Perform database transaction
   return await prisma.$transaction(
      async tx => {
         // a. Create the reservation with the determined room ID and status
         const reservation = await tx.reservation.create({
            data: {
               userId: data.userId,
               roomTypeId: targetRoomTypeId, // Use the resolved room ID
               propertyId: data.propertyId,
               startDate: data.startDate,
               endDate: data.endDate,
               orderStatus: initialOrderStatus, // Use the determined status
               expiresAt
            }
         });

         // b. Create Payment record (for tracking, even for manual transfers)
         await tx.payment.create({
            data: {
               reservationId: reservation.id,
               amount: totalPrice,
               method: data.paymentType, // Store the actual payment type selected
               paymentStatus: Status.PENDING_PAYMENT, // Payment itself starts pending
               payerEmail: data.payerEmail || '' // Get email from input or user lookup if needed
            }
         });

         return reservation;
      },
      { timeout: 30000 }
   );
}

function validateInput (input: unknown) {
   return createReservationSchema.parse(input);
}

async function validateRoomTypeAvailability (roomId: string, startDate: Date, endDate: Date) {
   const isAvailable = await checkAvailability(roomId, startDate, endDate);
   if (!isAvailable) {
      throw new Error('Room is not available for selected dates');
   }
}
