import prisma from '../../prisma';
import { Role, Status } from '@prisma/client';
import { cancelExpiredReservations } from './reservationExpiryService';
import EmailService from '../email/emailService';
import { Profile } from '../../interfaces';
import {
   cancelQuery,
   confirmBookingQuery,
   createBookingDetails,
   createUserWithProfile,
   findAndValidateReservationQuery,
   rejectionBookingQuery
} from './buildQueryHelper';
import {
   findAndValidateReservation,
   restoreAvailability,
   updateReservationAndPaymentStatus
} from './reservationService';

async function runPostRejectionExpiryCheck (reservationId: string): Promise<void> {
   await cancelExpiredReservations();
}

export function calculateNewExpiryTime (): Date {
   return new Date(Date.now() + 1 * 60 * 60 * 1000);
}

async function checkFinalReservationStatus (reservationId: string) {
   const finalReservationCheck = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { orderStatus: true, payment: { select: { paymentStatus: true } } }
   });

   if (!finalReservationCheck) {
      throw new Error('Reservation not found after rejection.');
   }

   if (finalReservationCheck.orderStatus === Status.CANCELLED) {
      throw new Error('Reservation was automatically cancelled because it had expired.');
   }
   return finalReservationCheck; // Optional: return data if needed elsewhere
}

async function findAndValidateReservationForOwner (reservationId: string, ownerId: string): Promise<any> {
   await cancelExpiredReservations();

   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: findAndValidateReservationQuery()
   });

   if (!reservation) {
      throw new Error('Reservation not found.');
   }
   if (reservation.Property?.OwnerId !== ownerId) {
      throw new Error('Unauthorized: You can only process reservations for your own properties.');
   }
   if (reservation.orderStatus !== Status.PENDING_CONFIRMATION) {
      if (reservation.orderStatus === Status.CONFIRMED) {
         throw new Error('Reservation is already confirmed.');
      } else if (reservation.orderStatus === Status.CANCELLED) {
         throw new Error('Reservation is cancelled.');
      } else if (reservation.orderStatus === Status.PENDING_PAYMENT) {
         throw new Error('Reservation is awaiting payment confirmation.');
      } else {
         throw new Error('Reservation cannot be processed at this stage.');
      }
   }
   return reservation;
}

export async function rejectReservationByOwner (reservationId: string, ownerId: string) {
   const reservation = await findAndValidateReservationForOwner(reservationId, ownerId);
   try {
      const updatedReservation = await prisma.reservation.update({
         where: {
            id: reservationId,
            orderStatus: Status.PENDING_CONFIRMATION
         },
         data: {
            orderStatus: Status.PENDING_PAYMENT,
            expiresAt: calculateNewExpiryTime(),
            payment: { update: { paymentStatus: Status.PENDING_PAYMENT } }
         },
         include: rejectionBookingQuery()
      });

      await runPostRejectionExpiryCheck(reservationId);

      try {
         if (!updatedReservation.User || !updatedReservation.User.email) {
            throw new Error('User email not found for reservation.');
         }
         const userWithProfile = createUserWithProfile(updatedReservation);
         const bookingDetails = createBookingDetails(updatedReservation);
         await EmailService.sendBookingRejection(userWithProfile, bookingDetails);
      } catch (emailError: any) {
         console.error(
            `Failed to send booking confirmation email for reservation ${reservationId} to ${
               reservation.User?.email || 'N/A'
            }:`,
            emailError
         );
         throw emailError;
      }

      return updatedReservation;
   } catch (error: any) {
      if (error.code === 'P2025') {
         console.error(`Failed to reject reservation ${reservationId}: Record not found or status mismatch.`);
         throw new Error('Reservation could not be rejected. It might have expired and been automatically cancelled.');
      }
      console.error(`Error rejecting reservation ${reservationId}:`, error);
      throw error;
   }
}

export async function confirmReservationByOwner (reservationId: string, ownerId: string) {
   const reservation = await findAndValidateReservationForOwner(reservationId, ownerId);

   try {
      const updatedReservation = await prisma.reservation.update({
         where: {
            id: reservationId,
            orderStatus: Status.PENDING_CONFIRMATION
         },
         data: {
            orderStatus: Status.CONFIRMED,
            payment: { update: { paymentStatus: Status.CONFIRMED } }
         },
         include: confirmBookingQuery()
      });

      try {
         if (!updatedReservation.User || !updatedReservation.User.email) {
            throw new Error('User email not found for reservation.');
         }
         const userWithProfile = createUserWithProfile(updatedReservation);
         const bookingDetails = createBookingDetails(updatedReservation);
         await EmailService.sendBookingConfirmation(userWithProfile, bookingDetails);
      } catch (emailError: any) {
         console.error(
            `Failed to send booking confirmation email for reservation ${reservationId} to ${
               reservation.User?.email || 'N/A'
            }:`,
            emailError
         );
         throw emailError;
      }

      return updatedReservation;
   } catch (error: any) {
      if (error.code === 'P2025') {
         console.error(`Failed to confirm reservation ${reservationId}: Record not found or status mismatch.`);
         throw new Error('Reservation could not be confirmed. It might have expired and been automatically cancelled.');
      }
      console.error(`Error confirming reservation ${reservationId}:`, error);
      throw error;
   }
}

export async function cancelReservation (reservationId: string, userId: string, role: Role) {
   try {
      const reservation = await findAndValidateReservation(reservationId, userId);

      const updatedReservation = await prisma.$transaction(
         async tx => {
            await updateReservationAndPaymentStatus(tx, reservationId);

            await restoreAvailability(tx, reservation);

            return await tx.reservation.findUnique({
               where: { id: reservationId },
               include: cancelQuery()
            });
         },
         { timeout: 30000 }
      );

      try {
         if (!updatedReservation?.User || !updatedReservation?.User.email) {
            throw new Error('User email not found for reservation.');
         }
         const userWithProfile = createUserWithProfile(updatedReservation);
         const bookingDetails = createBookingDetails(updatedReservation);
         console.log(role);
         if (role === Role.OWNER) {
            await EmailService.sendBookingCancelationByOwner(userWithProfile, bookingDetails);
         } else {
            await EmailService.sendBookingCancelationByUser(userWithProfile, bookingDetails);
         }
      } catch (emailError: any) {
         const userWithProfile = createUserWithProfile(updatedReservation);
         console.error(
            `Failed to send booking confirmation email for reservation ${reservationId} to ${
               userWithProfile?.email || 'N/A'
            }:`,
            emailError
         );
         throw emailError;
      }
      return updatedReservation;
   } catch (error: any) {
      if (error.code === 'P2025') {
         console.error(`Failed to cancel reservation ${reservationId}: Record not found or status mismatch.`);
         throw new Error('Reservation could not be cancelled. It might have expired and been automatically confirmed.');
      }
      console.error(`Error cancelling reservation ${reservationId}:`, error);
      throw error;
   }
}
