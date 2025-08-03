// services/createReservation.ts
import prisma from '../../prisma';
import { calculateTotalPrice } from './pricingService';
import { checkAvailability, decrementAvailability } from './availabilityService';
import { resolveTargetRoomTypeId } from './propertyRoomResolver';
import { createReservationSchema } from '../../validations/reservationSchema';
import { Status } from '@prisma/client';

export async function createReservation (input: unknown) {
   const data = validateInput(input);
   const targetRoomTypeId = await resolveTargetRoomTypeId(data.propertyId, data.roomTypeId);

   await validateRoomTypeAvailability(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));

   const totalPrice = await calculateTotalPrice(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));

   const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

   const initialOrderStatus: Status = Status.PENDING_PAYMENT;

   return await prisma.$transaction(
      async tx => {
         const reservation = await tx.reservation.create({
            data: {
               userId: data.userId,
               roomTypeId: targetRoomTypeId,
               propertyId: data.propertyId,
               startDate: data.startDate,
               endDate: data.endDate,
               orderStatus: initialOrderStatus,
               expiresAt
            }
         });

         await tx.payment.create({
            data: {
               reservationId: reservation.id,
               amount: totalPrice,
               method: data.paymentType,
               paymentStatus: Status.PENDING_PAYMENT,
               payerEmail: data.payerEmail || ''
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
