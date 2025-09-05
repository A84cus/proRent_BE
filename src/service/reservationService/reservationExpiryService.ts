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
         return { cancelledReservationIds };
      }

      for (const reservation of expiredReservations) {
         try {
            await prisma.$transaction(
               async tx => {
                  const updatedReservation = await tx.reservation.update({
                     where: { id: reservation.id },
                     data: { orderStatus: Status.CANCELLED }
                  });
                  const updatedPayment = await tx.payment.updateMany({
                     where: { reservationId: reservation.id },
                     data: { paymentStatus: Status.CANCELLED }
                  });

                  if (reservation.RoomType?.id && reservation.startDate && reservation.endDate) {
                     await incrementAvailability(
                        tx,
                        reservation.RoomType.id,
                        new Date(reservation.startDate),
                        new Date(reservation.endDate)
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
            throw error(`Error cancelling reservation ${reservation.id}: ${error.message}`);
         }
      }
      return { cancelledReservationIds };
   } catch (error) {
      throw error;
   }
}

export async function runExpiryCheckManually () {
   try {
      const result = await cancelExpiredReservations();
   } catch (err) {
      throw err;
   }
}
