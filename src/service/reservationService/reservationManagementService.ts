import prisma from '../../prisma';
import { Status } from '@prisma/client';
import { cancelExpiredReservations } from './reservationExpiryService';
import EmailService from '../emailService';

// --- Placeholder for the email sending function ---
// You will replace this with your actual email sending logic later.
async function sendConfirmationEmail (reservationId: string): Promise<void> {
   console.log(`[PLACEHOLDER] Sending confirmation email for reservation ID: ${reservationId}`);
   // TODO: Implement actual email sending logic here
   // });
}

// --- Helper function to find and validate reservation for owner actions ---
async function findAndValidateReservationForOwner (reservationId: string, ownerId: string): Promise<any> {
   // Replace 'any' with your Reservation type if available

   console.log(`Running expiry check before processing reservation ${reservationId} for owner ${ownerId}.`);
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
            orderStatus: Status.PENDING_PAYMENT
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

      console.log(`Reservation ${reservationId} rejected by owner ${ownerId}. Status changed to PENDING_PAYMENT.`);
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

// --- Service function to confirm a reservation by the owner ---
export async function confirmReservationByOwner (reservationId: string, ownerId: string) {
   const reservation = await findAndValidateReservationForOwner(reservationId, ownerId);

   try {
      const updatedReservation = await prisma.reservation.update({
         where: {
            id: reservationId,
            orderStatus: Status.PENDING_CONFIRMATION
         },
         data: {
            orderStatus: Status.CONFIRMED
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
      console.log(`Reservation ${reservationId} confirmed by owner ${ownerId}. Status changed to CONFIRMED.`);
      try {
         // --- Prepare data for the email ---
         // Use the 'reservation' object fetched by findAndValidateReservationForOwner
         // which should have the User (with profile) and other details.

         // Check if required data is present
         if (!reservation.User || !reservation.User.email) {
            throw new Error('User email not found for reservation.');
         }

         // Prepare UserWithProfile object (ensure it matches your interface)
         const userWithProfile = {
            ...reservation.User,
            profile: reservation.User.profile || null // Ensure profile is handled even if null
         };

         // Prepare BookingDetails object (ensure it matches your interface)
         // Adjust field names based on your Prisma schema and BookingDetails interface
         const bookingDetails = {
            id: reservation.id,
            propertyName: reservation.Property?.name || 'N/A',
            roomTypeName: reservation.RoomType?.name || 'N/A',
            checkIn: reservation.startDate,
            checkOut: reservation.endDate,
            totalAmount: reservation.payment?.amount || 0, // Assuming amount is total price
            paymentStatus: reservation.payment?.paymentStatus || 'N/A'
         };

         // --- Send the email using the EmailService ---
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
         // Depending on your requirements, decide if email failure should affect the confirmation process.
         // For now, we log the error but consider the confirmation successful.
         // You might want to store email status in the DB (e.g., in EmailLog).
         // If you want to signal email failure to the controller, you could re-throw or attach info.
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
