// services/createReservation.ts
import prisma from '../../prisma';
import { calculateTotalPrice } from './pricingService';
import { checkAvailability, DecrementAvailability, incrementAvailability } from './availabilityService';
import { resolveTargetRoomTypeId } from './propertyRoomResolver';
import { createReservationSchema } from '../../validations/reservationSchema';
import { Status, PaymentType } from '@prisma/client';
import { createXenditInvoice } from './xenditService';

async function validateBooking (data: any) {
   const targetRoomTypeId = await resolveTargetRoomTypeId(data.propertyId, data.roomTypeId);
   const startDate = new Date(data.startDate);
   const endDate = new Date(data.endDate);

   const isAvailable = await checkAvailability(targetRoomTypeId, startDate, endDate);
   if (!isAvailable) {
      throw new Error('The selected accommodation type is not available for the chosen dates.');
   }

   const totalPrice = await calculateTotalPrice(targetRoomTypeId, startDate, endDate);
   const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
   const initialOrderStatus: Status = Status.PENDING_PAYMENT;

   return {
      targetRoomTypeId,
      totalPrice,
      expiresAt,
      initialOrderStatus,
      startDate,
      endDate
   };
}

async function executeReservationTransaction (data: any, validationData: any) {
   const { targetRoomTypeId, totalPrice, expiresAt, initialOrderStatus, startDate, endDate } = validationData;

   return await prisma.$transaction(
      async tx => {
         const reservation = await tx.reservation.create({
            data: {
               userId: data.userId,
               roomTypeId: targetRoomTypeId,
               propertyId: data.propertyId,
               startDate,
               endDate,
               orderStatus: initialOrderStatus,
               expiresAt
            }
         });

         const paymentRecord = await tx.payment.create({
            data: {
               reservationId: reservation.id,
               amount: totalPrice,
               method: data.paymentType,
               paymentStatus: Status.PENDING_PAYMENT,
               payerEmail: data.payerEmail || ''
            }
         });

         await DecrementAvailability(tx, targetRoomTypeId, startDate, endDate);

         return { reservation, paymentRecordId: paymentRecord.id };
      },
      { timeout: 30000 }
   );
}

async function handleXenditPostProcessing (paymentRecordId: string, reservationId: string) {
   try {
      const xenditInvoiceDetails = await createXenditInvoice(paymentRecordId);
      return {
         reservationId,
         paymentUrl: xenditInvoiceDetails.invoiceUrl,
         message: 'Reservation created, redirecting to payment.'
      };
   } catch (xenditError: any) {
      console.error('Error creating Xendit invoice after reservation:', xenditError);
      throw new Error(`Reservation created, but Xendit payment setup failed: ${xenditError.message}`);
   }
}

function handleManualPostProcessing (reservation: any) {
   return {
      reservation,
      message: 'Reservation created. Please upload payment proof.'
   };
}

export async function createReservation (input: unknown) {
   const data = validateInput(input);
   const validationData = await validateBooking(data);

   const { reservation, paymentRecordId } = await executeReservationTransaction(data, validationData);

   if (data.paymentType === PaymentType.XENDIT) {
      return await handleXenditPostProcessing(paymentRecordId, reservation.id);
   } else {
      return handleManualPostProcessing(reservation);
   }
}

function validateInput (input: unknown) {
   return createReservationSchema.parse(input);
}

async function findAndValidateReservation (reservationId: string, userId: string) {
   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         payment: {
            select: {
               id: true,
               amount: true,
               method: true
            }
         },
         PaymentProof: true,
         RoomType: {
            select: { id: true }
         }
      }
   });

   if (!reservation) {
      throw new Error('Reservation not found.');
   }
   if (reservation.userId !== userId) {
      throw new Error('Unauthorized: You can only cancel your own reservations.');
   }

   if (reservation.orderStatus === Status.CANCELLED) {
      throw new Error('Reservation is already cancelled.');
   }

   if (reservation.orderStatus !== Status.PENDING_PAYMENT) {
      throw new Error('Cancellation is not allowed for reservations that are confirmed or awaiting confirmation.');
   }

   return reservation;
}

async function updateReservationAndPaymentStatus (tx: any, reservationId: string) {
   await tx.reservation.update({
      where: { id: reservationId },
      data: { orderStatus: Status.CANCELLED }
   });

   await tx.payment.updateMany({
      where: { reservationId },
      data: { paymentStatus: Status.CANCELLED }
   });
}

async function restoreAvailability (tx: any, reservation: any) {
   if (reservation.RoomType?.id && reservation.startDate && reservation.endDate) {
      await incrementAvailability(
         tx,
         reservation.RoomType.id,
         new Date(reservation.startDate),
         new Date(reservation.endDate)
      );
   } else {
      console.warn(`Could not restore availability for reservation ${reservation.id}: Missing RoomTypeId or dates.`);
   }
}

export async function cancelReservation (reservationId: string, userId: string) {
   const reservation = await findAndValidateReservation(reservationId, userId);

   const updatedReservation = await prisma.$transaction(
      async tx => {
         await updateReservationAndPaymentStatus(tx, reservationId);

         await restoreAvailability(tx, reservation);

         return await tx.reservation.findUnique({
            where: { id: reservationId },
            include: {
               payment: {
                  select: {
                     id: true,
                     amount: true,
                     method: true,
                     paymentStatus: true,
                     createdAt: true,
                     updatedAt: true
                  }
               },
               RoomType: {
                  select: { id: true, name: true }
               },
               Property: {
                  select: { id: true, name: true }
               }
            }
         });
      },
      { timeout: 30000 }
   );

   return updatedReservation;
}
