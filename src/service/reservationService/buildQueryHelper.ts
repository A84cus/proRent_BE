import { Role, Status } from '@prisma/client';
import { calculateNewExpiryTime } from './reservationManagementService';

export function rejectionBookingQuery () {
   return {
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
      payment: { select: { id: true, amount: true, method: true, paymentStatus: true } },
      PaymentProof: { include: { picture: true } }
   };
}

export function confirmBookingQuery () {
   return {
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
      payment: {
         select: { id: true, amount: true, method: true, paymentStatus: true }
      },
      PaymentProof: { include: { picture: true } }
   };
}

export function findAndValidateReservationQuery () {
   return {
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
      payment: {
         select: { id: true, amount: true, method: true, paymentStatus: true }
      }
   };
}

export function cancelQuery () {
   return {
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
      User: {
         select: {
            id: true,
            email: true,
            role: true,
            profile: {
               select: {
                  firstName: true,
                  lastName: true,
                  phone: true
               }
            }
         }
      },
      RoomType: {
         select: { id: true, name: true }
      },
      Property: {
         select: { id: true, name: true }
      }
   };
}

export function createUserWithProfile (updatedReservation: any): {
   id: string;
   email: string;
   role: Role;
   profile: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
   };
} {
   return {
      id: updatedReservation.User.id,
      email: updatedReservation.User.email,
      role: updatedReservation.User.role,
      profile: {
         id: updatedReservation.User.profile?.id ?? '',
         firstName: updatedReservation.User.profile?.firstName ?? '',
         lastName: updatedReservation.User.profile?.lastName ?? '',
         phone: updatedReservation.User.profile?.phone ?? '',
         address: updatedReservation.User.profile?.address ?? ''
      }
   };
}

export function createBookingDetails (updatedReservation: any): {
   id: string;
   propertyName: string;
   roomTypeName: string;
   checkIn: string;
   checkOut: string;
   totalAmount: number;
   paymentStatus: string;
} {
   return {
      id: updatedReservation.id,
      propertyName: updatedReservation.Property?.name || 'N/A',
      roomTypeName: updatedReservation.RoomType?.name || 'N/A',
      checkIn: updatedReservation.startDate.toISOString().split('T')[0],
      checkOut: updatedReservation.endDate.toISOString().split('T')[0],
      totalAmount: updatedReservation.payment?.amount || 0,
      paymentStatus: updatedReservation.payment?.paymentStatus || 'N/A'
   };
}
