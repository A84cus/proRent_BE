// services/reservationExpiryService.ts
import prisma from '../../prisma'; // Adjust the path if necessary
import { Status } from '@prisma/client';
import { incrementAvailability } from './availabilityService';

export async function cancelExpiredReservations (): Promise<{ cancelledReservationIds: string[] }> {
   const now = new Date();
   const cancelledReservationIds: string[] = [];

   try {
      const expiredReservations = await prisma.reservation.findMany({
         where: {
            orderStatus: Status.PENDING_PAYMENT,
            expiresAt: {
               lt: now
            },
            payment: {
               paymentStatus: Status.PENDING_PAYMENT
            }
         },
         include: {
            RoomType: {
               select: {
                  id: true
               }
            },
            payment: {
               select: {
                  id: true,
                  paymentStatus: true
               }
            }
         }
      });

      if (expiredReservations.length === 0) {
         console.log('No expired reservations found.');
         return { cancelledReservationIds };
      }

      console.log(`Found ${expiredReservations.length} expired reservation(s). Processing cancellations...`);

      for (const reservation of expiredReservations) {
         try {
            await prisma.$transaction(
               async tx => {
                  const updatedReservation = await tx.reservation.update({
                     where: { id: reservation.id },
                     data: { orderStatus: Status.CANCELLED }
                  });
                  console.log(`Reservation ${reservation.id} status updated to CANCELLED.`);
                  const updatedPayment = await tx.payment.updateMany({
                     where: { reservationId: reservation.id }, // Match payments for this specific reservation
                     data: { paymentStatus: Status.CANCELLED }
                  });
                  console.log(
                     `Payment(s) for reservation ${reservation.id} status updated to CANCELLED. Count: ${updatedPayment.count}`
                  );

                  if (reservation.RoomType?.id && reservation.startDate && reservation.endDate) {
                     await incrementAvailability(
                        tx, // Pass the transaction client
                        reservation.RoomType.id,
                        new Date(reservation.startDate),
                        new Date(reservation.endDate)
                     );
                     console.log(
                        `Availability restored for RoomTypeId ${reservation.RoomType.id} from ${reservation.startDate} to ${reservation.endDate} due to reservation ${reservation.id} expiry.`
                     );
                  } else {
                     console.warn(
                        `Could not restore availability for expired reservation ${reservation.id}: Missing RoomTypeId or dates.`
                     );
                  }

                  cancelledReservationIds.push(reservation.id);
               },
               { timeout: 30000 }
            );
         } catch (error: any) {
            console.error(`Error cancelling reservation ${reservation.id}:`, error);
            throw error(`Error cancelling reservation ${reservation.id}: ${error.message}`);
         }
      }

      console.log(`Finished processing expired reservations. Cancelled IDs: ${cancelledReservationIds.join(', ')}`);
      return { cancelledReservationIds };
   } catch (error) {
      console.error('Error finding or cancelling expired reservations:', error);
      throw error;
   }
}

// --- Optional: Function to run the check manually (e.g., for testing) ---
export async function runExpiryCheckManually () {
   console.log('Running manual reservation expiry check...');
   try {
      const result = await cancelExpiredReservations();
      console.log('Manual check completed. Result:', result);
   } catch (err) {
      console.error('Manual check failed:', err);
   }
}
