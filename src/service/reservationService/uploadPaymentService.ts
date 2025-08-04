// services/uploadPaymentProofService.ts
import prisma from '../../prisma';
import UploadService from '../uploadService';
import { Status } from '@prisma/client';

export async function uploadPaymentProof (
   reservationId: string,
   userId: string,
   fileBuffer: Buffer,
   originalFilename: string
) {
   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         payment: true,
         PaymentProof: {
            include: {
               picture: true
            }
         }
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

   // Check if the payment method is MANUAL_TRANSFER
   if (reservation.payment?.method !== 'MANUAL_TRANSFER') {
      throw new Error('Payment proof upload is only allowed for manual transfer payments.');
   }

   if (reservation.PaymentProof) {
      throw new Error('Payment proof already uploaded for this reservation.');
   }

   const fileExtension = originalFilename.split('.').pop()?.toLowerCase();
   const allowedExtensions = [ 'jpg', 'jpeg', 'png' ]; // Requirement
   const maxFileSizeBytes = 1 * 1024 * 1024; // 1MB in bytes // Requirement

   if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type. Only .jpg and .png files are allowed.');
   }

   if (fileBuffer.length > maxFileSizeBytes) {
      throw new Error('File size exceeds the maximum allowed size of 1MB.');
   }

   let uploadServiceResult;
   try {
      uploadServiceResult = await UploadService.processFileUpload({
         buffer: fileBuffer,
         originalname: originalFilename,
         type: 'proof',
         alt: `Payment proof for reservation ${reservationId}`
      });
      console.log('File uploaded via UploadService:', uploadServiceResult.id); // This should be the Picture ID
   } catch (uploadError: any) {
      console.error('Error uploading file via UploadService:', uploadError);

      throw new Error(`Failed to upload payment proof: ${uploadError.message}`);
   }

   const pictureId = uploadServiceResult.id;
   if (!pictureId) {
      // Defensive check
      throw new Error('Failed to retrieve Picture ID after upload.');
   }

   return await prisma.$transaction(async tx => {
      await tx.paymentProof.create({
         data: {
            reservationId: reservation.id,
            pictureId
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
            where: { id: reservation.payment?.id },
            data: {
               paymentStatus: Status.PENDING_CONFIRMATION
            }
         });
      }

      return updatedReservation;
   });
}
