import prisma from '../../prisma';
import { Status } from '@prisma/client';
import EmailService from '../email/emailService';

export async function sendBookingReminderForTomorrow () {
   try {
      // Get all confirmed reservations for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfDay = new Date(tomorrow);
      endOfDay.setHours(23, 59, 59, 999);

      const reservations = await prisma.reservation.findMany({
         where: {
            startDate: {
               gte: tomorrow,
               lt: endOfDay
            },
            orderStatus: Status.CONFIRMED,
            payment: {
               paymentStatus: Status.CONFIRMED
            }
         },
         include: {
            Property: {
               select: { id: true, name: true }
            },
            RoomType: {
               select: { id: true, name: true }
            },
            User: {
               select: {
                  id: true,
                  email: true,
                  profile: {
                     select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        address: true
                     }
                  }
               }
            },
            payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
         }
      });

      for (const reservation of reservations) {
         try {
            if (!reservation.User || !reservation.User.email) {
               console.warn(`User email not found for reservation ${reservation.id}`);
               continue;
            }

            const userWithProfile = {
               id: reservation.User.id,
               email: reservation.User.email,
               profile: {
                  id: reservation.User.profile?.id ?? '',
                  firstName: reservation.User.profile?.firstName ?? '',
                  lastName: reservation.User.profile?.lastName ?? '',
                  phone: reservation.User.profile?.phone ?? '',
                  address: reservation.User.profile?.address ?? ''
               }
            };

            const bookingDetails = {
               id: reservation.id,
               propertyName: reservation.Property?.name || 'N/A',
               roomTypeName: reservation.RoomType?.name || 'N/A',
               checkIn: reservation.startDate.toISOString().split('T')[0],
               checkOut: reservation.endDate.toISOString().split('T')[0],
               totalAmount: reservation.payment?.amount || 0,
               paymentStatus: reservation.payment?.paymentStatus || 'N/A'
            };

            await EmailService.sendBookingReminder(userWithProfile, bookingDetails);
         } catch (emailError: any) {
            console.error(
               `Failed to send booking reminder email for reservation ${reservation.id} to ${
                  reservation.User?.email || 'N/A'
               }:`,
               emailError
            );
         }
      }

      return { success: true, count: reservations.length };
   } catch (error: any) {
      console.error('Error sending booking reminder emails:', error);
      throw error;
   }
}

export async function sendBookingReminderByReservationId (reservationId: string) {
   try {
      const reservation = await prisma.reservation.findUnique({
         where: { id: reservationId },
         include: {
            Property: {
               select: { id: true, name: true }
            },
            RoomType: {
               select: { id: true, name: true }
            },
            User: {
               select: {
                  id: true,
                  email: true,
                  profile: {
                     select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        address: true
                     }
                  }
               }
            },
            payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
         }
      });

      if (!reservation) {
         throw new Error('Reservation not found');
      }

      if (!reservation.User || !reservation.User.email) {
         throw new Error('User email not found for reservation');
      }

      const userWithProfile = {
         id: reservation.User.id,
         email: reservation.User.email,
         profile: {
            id: reservation.User.profile?.id ?? '',
            firstName: reservation.User.profile?.firstName ?? '',
            lastName: reservation.User.profile?.lastName ?? '',
            phone: reservation.User.profile?.phone ?? '',
            address: reservation.User.profile?.address ?? ''
         }
      };

      const bookingDetails = {
         id: reservation.id,
         propertyName: reservation.Property?.name || 'N/A',
         roomTypeName: reservation.RoomType?.name || 'N/A',
         checkIn: reservation.startDate.toISOString().split('T')[0],
         checkOut: reservation.endDate.toISOString().split('T')[0],
         totalAmount: reservation.payment?.amount || 0,
         paymentStatus: reservation.payment?.paymentStatus || 'N/A'
      };

      await EmailService.sendBookingReminder(userWithProfile, bookingDetails);

      return { success: true, reservationId };
   } catch (error: any) {
      console.error(`Error sending booking reminder for reservation ${reservationId}:`, error);
      throw error;
   }
}
