// src/services/uploadPaymentProofService.ts
import { Express } from 'express';
import prisma from '../../prisma'; // Adjust path to your Prisma client
import { Status } from '@prisma/client';
import { uploadImage } from './Image.service'; // Adjust path to your cloudinary utility
import { paymentProofFileSchema, PaymentProofFileInput } from '../../validations/paymentProofValidation'; // Adjust path
import { ZodError } from 'zod';

export async function uploadPaymentProof (reservationId: string, userId: string, file: Express.Multer.File) {
   // --- 1. Authorization & Initial Reservation Validation ---
   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         payment: true,
         PaymentProof: {
            include: {
               picture: true
            }
         },
         RoomType: true, // Include for potential use (e.g., alt text generation)
         Property: true // Include for potential use
      }
   });

   if (!reservation) {
      throw new Error('Reservation not found.');
   }

   if (reservation.userId !== userId) {
      throw new Error('Unauthorized: You can only upload proof for your own reservations.');
   }

   if (reservation.orderStatus !== Status.PENDING_PAYMENT) {
      throw new Error('Payment proof can only be uploaded for reservations pending payment.');
   }

   if (reservation.payment?.method !== 'MANUAL_TRANSFER') {
      throw new Error('Payment proof upload is only allowed for manual transfer payments.');
   }

   if (reservation.PaymentProof) {
      throw new Error('Payment proof already uploaded for this reservation.');
   }

   // --- 2. Zod Validation of File Metadata ---
   const fileValidationData: PaymentProofFileInput = {
      originalname: file.originalname,
      size: file.size,
      type: 'proof'
   };

   const validationResult = paymentProofFileSchema.safeParse(fileValidationData);
   if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(e => e.message).join(', ');

      throw new Error(`File validation failed: ${errorMessages}`);
   }

   let cloudinaryUrl: string;
   try {
      cloudinaryUrl = await uploadImage(file, 'payment_proofs');
      if (!cloudinaryUrl) {
         throw new Error('Cloudinary upload did not return a URL.');
      }
   } catch (uploadError: any) {
      console.error('Error uploading file to Cloudinary:', uploadError);
      throw new Error(`Failed to upload payment proof to storage: ${uploadError.message || uploadError}`);
   }

   // --- 4. Database Transaction ---
   return await prisma.$transaction(async tx => {
      // a. Create the Picture record
      const pictureRecord = await tx.picture.create({
         data: {
            url: cloudinaryUrl,
            alt:
               validationResult.data.alt || `Payment proof for ${reservation.Property?.name || 'property'} reservation`, // Generate alt if not provided
            type: 'proof',
            sizeKB: Math.round(file.size / 1024),
            uploadedAt: new Date()
         }
      });

      await tx.paymentProof.create({
         data: {
            reservationId: reservation.id,
            pictureId: pictureRecord.id
         }
      });

      const updatedReservation = await tx.reservation.update({
         where: { id: reservation.id },
         data: {
            orderStatus: Status.PENDING_CONFIRMATION
         },
         include: {
            payment: true,
            PaymentProof: {
               include: {
                  picture: true
               }
            },
            RoomType: true,
            Property: true
         }
      });

      if (reservation.payment?.id) {
         await tx.payment.update({
            where: { id: reservation.payment.id },
            data: {
               paymentStatus: Status.PENDING_CONFIRMATION
            }
         });
      }

      return updatedReservation;
   });
}
