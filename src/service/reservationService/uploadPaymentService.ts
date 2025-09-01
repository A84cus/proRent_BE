// src/services/uploadPaymentProofService.ts
import { Express } from 'express';
import prisma from '../../prisma'; // Adjust path to your Prisma client
import { Status } from '@prisma/client';
import { uploadImage } from './Image.service'; // Adjust path to your cloudinary utility
import { paymentProofFileSchema, PaymentProofFileInput } from '../../validations'; // Adjust path
import { ZodError } from 'zod';
import { extractSerialFromInvoiceNumber } from './invoiceNumberService';

// 1. Authorization & Initial Reservation Validation
async function validateReservationAccess (reservationId: string, userId: string) {
   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
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

   return reservation;
}

// 2. File Validation
function validatePaymentProofFile (file: Express.Multer.File) {
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

   return validationResult;
}

// 3. File Upload to Cloudinary
async function uploadFileToStorage (file: Express.Multer.File): Promise<string> {
   try {
      const cloudinaryUrl = await uploadImage(file, 'payment_proofs');
      if (!cloudinaryUrl) {
         throw new Error('Cloudinary upload did not return a URL.');
      }
      return cloudinaryUrl;
   } catch (uploadError: any) {
      console.error('Error uploading file to Cloudinary:', uploadError);
      throw new Error(`Failed to upload payment proof to storage: ${uploadError.message || uploadError}`);
   }
}

// 4. Generate Alt Text
function generateAltText (reservation: any, validationResult: any): string {
   const serial = reservation.payment?.invoiceNumber
      ? extractSerialFromInvoiceNumber(reservation.payment.invoiceNumber)
      : '001';

   return (
      validationResult.data.alt ||
      `Payment proof for Invoice No. ${reservation.payment?.invoiceNumber || serial} reservation `
   );
}

// 5. Create Database Records
async function createPaymentProofRecords (
   tx: any,
   reservation: any,
   file: Express.Multer.File,
   cloudinaryUrl: string,
   altText: string
) {
   // a. Create the Picture record
   const pictureRecord = await tx.picture.create({
      data: {
         url: cloudinaryUrl,
         alt: altText,
         type: 'proof',
         sizeKB: Math.round(file.size / 1024),
         uploadedAt: new Date()
      }
   });

   // b. Create Payment Proof record
   await tx.paymentProof.create({
      data: {
         reservationId: reservation.id,
         pictureId: pictureRecord.id
      }
   });

   return pictureRecord;
}

// 6. Update Reservation and Payment Status
async function updateReservationStatus (tx: any, reservation: any, reservationId: string) {
   // Update reservation status
   const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: {
         orderStatus: Status.PENDING_CONFIRMATION
      },
      include: {
         payment: {
            select: {
               id: true,
               amount: true,
               method: true,
               paymentStatus: true,
               payerEmail: true,
               createdAt: true,
               updatedAt: true
            }
         },
         PaymentProof: {
            select: {
               id: true,
               pictureId: true,
               picture: {
                  select: {
                     id: true,
                     url: true,
                     alt: true,
                     type: true,
                     sizeKB: true,
                     uploadedAt: true
                  }
               }
            }
         },
         RoomType: {
            select: {
               id: true,
               name: true
            }
         },
         Property: {
            select: {
               id: true,
               name: true,
               location: true
            }
         }
      }
   });

   // Update payment status if payment exists
   if (reservation.payment?.id) {
      await tx.payment.update({
         where: { id: reservation.payment.id },
         data: {
            paymentStatus: Status.PENDING_CONFIRMATION
         }
      });
   }

   return updatedReservation;
}

// Main function that combines all parts
export async function uploadPaymentProof (reservationId: string, userId: string, file: Express.Multer.File) {
   // Step 1: Validate reservation access
   const reservation = await validateReservationAccess(reservationId, userId);

   // Step 2: Validate file
   const validationResult = validatePaymentProofFile(file);

   // Step 3: Upload file to storage
   const cloudinaryUrl = await uploadFileToStorage(file);

   // Step 4: Generate alt text
   const altText = generateAltText(reservation, validationResult);

   // Step 5 & 6: Database operations in transaction
   return await prisma.$transaction(
      async (tx: any) => {
         // Create payment proof records
         await createPaymentProofRecords(tx, reservation, file, cloudinaryUrl, altText);

         // Update reservation and payment status
         const updatedReservation = await updateReservationStatus(tx, reservation, reservationId);

         return updatedReservation;
      },
      {
         timeout: 60000
      }
   );
}
