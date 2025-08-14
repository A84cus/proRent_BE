import prisma from '../../prisma';
import { Status } from '@prisma/client';
import { cancelExpiredReservations } from './reservationExpiryService';
import EmailService from '../emailService';
import { Profile } from '../../interfaces/userAndProfileInterface';

async function runPostRejectionExpiryCheck (reservationId: string): Promise<void> {
   console.log(`Checking for expiry after rejecting reservation ${reservationId}...`);
   await cancelExpiredReservations();
}

function calculateNewExpiryTime (): Date {
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
      console.log(`Reservation ${reservationId} was automatically cancelled because it had expired.`);
      throw new Error('Reservation was automatically cancelled because it had expired.');
   }

   console.log(`Reservation ${reservationId} successfully rejected (status PENDING_PAYMENT).`);
   return finalReservationCheck; // Optional: return data if needed elsewhere
}

async function findAndValidateReservationForOwner (reservationId: string, ownerId: string): Promise<any> {
   await cancelExpiredReservations();

   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         Property: {
            select: {
               OwnerId: true,
               name: true,
               location: true,
               roomTypes: {
                  select: {
                     name: true
                  }
               }
            }
         },
         User: {
            select: {
               email: true,

               profile: {
                  select: {
                     firstName: true,
                     lastName: true
                  }
               }
            }
         },
         payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
      }
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
         include: {
            Property: {
               select: { id: true, name: true }
            },
            RoomType: {
               select: { id: true, name: true }
            },
            User: {
               select: { id: true, email: true }
            },
            payment: { select: { id: true, amount: true, method: true } },
            PaymentProof: { include: { picture: true } }
         }
      });

      await runPostRejectionExpiryCheck(reservationId);
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
         include: {
            Property: {
               select: { id: true, name: true }
            },
            RoomType: {
               select: { id: true, name: true }
            },
            User: {
               select: { id: true, email: true, profile: true }
            },
            payment: { select: { id: true, amount: true, method: true, paymentStatus: true } },
            PaymentProof: { include: { picture: true } }
         }
      });
      console.log(`Reservation ${reservationId} confirmed by owner ${ownerId}. Status changed to CONFIRMED.`);
      try {
         if (!updatedReservation.User || !updatedReservation.User.email) {
            throw new Error('User email not found for reservation.');
         }
         const userWithProfile = {
            id: updatedReservation.User.id,
            email: updatedReservation.User.email,
            profile: {
               id: updatedReservation.User.profile?.id ?? '',
               firstName: updatedReservation.User.profile?.firstName ?? '',
               lastName: updatedReservation.User.profile?.lastName ?? '',
               phone: updatedReservation.User.profile?.phone ?? '',
               address: updatedReservation.User.profile?.address ?? ''
            }
         };

         const bookingDetails = {
            id: updatedReservation.id,
            propertyName: updatedReservation.Property?.name || 'N/A',
            roomTypeName: updatedReservation.RoomType?.name || 'N/A',
            checkIn: updatedReservation.startDate.toISOString().split('T')[0],
            checkOut: updatedReservation.endDate.toISOString().split('T')[0],
            totalAmount: updatedReservation.payment?.amount || 0,
            paymentStatus: updatedReservation.payment?.paymentStatus || 'N/A'
         };

         await EmailService.sendBookingConfirmation(userWithProfile, bookingDetails);
         console.log(
            `Booking confirmation email sent successfully to ${reservation.User.email} for reservation ${reservationId}.`
         );
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
