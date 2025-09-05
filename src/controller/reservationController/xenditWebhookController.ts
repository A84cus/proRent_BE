// controllers/xenditController.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../../prisma'; // Adjust the path to your Prisma client instance
import { Status } from '@prisma/client';
import { XENDIT_WEBHOOK_TOKEN } from '../../config'; // Adjust path to your environment config
import {
   RESERVATION_ERROR_MESSAGES,
   RESERVATION_SUCCESS_MESSAGES
} from '../../constants/controllers/reservation/reservationMessages';

export const handleXenditInvoiceCallback = async (req: Request, res: Response) => {
   console.log('Received Xendit Invoice Callback');

   // --- 1. Retrieve Raw Body and Signature ---
   const rawBody = (req as any).rawBody; // Provided by express.raw middleware
   const signature = req.get('Xendit-Signature');

   // --- 2. Basic Request Validation ---
   if (!XENDIT_WEBHOOK_TOKEN) {
      console.error('XENDIT_WEBHOOK_TOKEN is not configured.');
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
   }

   if (!signature) {
      console.warn('Missing Xendit-Signature header.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
   }

   if (!rawBody) {
      console.warn('Missing request body.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
   }

   // --- 3. Verify Webhook Signature ---
   try {
      const expectedSignature = crypto
         .createHmac('sha256', XENDIT_WEBHOOK_TOKEN)
         .update(rawBody, 'utf8') // Ensure correct encoding for raw body
         .digest('hex');

      const trusted = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));

      if (!trusted) {
         console.warn('Invalid Xendit webhook signature.');
         return res.status(401).send(RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
      }
      console.log('Xendit webhook signature verified.');
   } catch (verifyError: any) {
      console.error('Error verifying Xendit signature:', verifyError);
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
   }

   // --- 4. Parse and Validate Callback Payload ---
   let callbackData: any;
   try {
      callbackData = JSON.parse(rawBody.toString('utf8'));
      console.log('Parsed callback data:', {
         id: callbackData.id,
         status: callbackData.status
      });
   } catch (parseError: any) {
      console.error('Error parsing Xendit callback JSON:', parseError);
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
   }

   const xenditInvoiceId = callbackData.id;
   const invoiceStatus = callbackData.status; // e.g., 'PAID', 'EXPIRED', 'FAILED'

   if (!xenditInvoiceId) {
      console.warn('Callback payload missing invoice ID.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
   }

   // --- 5. Process the Callback ---
   try {
      // --- a. Find the corresponding Payment record ---
      const paymentRecord = await prisma.payment.findUnique({
         where: { xenditInvoiceId },
         include: {
            reservation: true // Include reservation for status update
         }
      });

      if (!paymentRecord) {
         console.warn(`Payment record not found for Xendit invoice ID: ${xenditInvoiceId}`);
         // Acknowledge receipt even if not found to prevent retries for unknown invoices.
         return res.status(200).send(RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
      }

      console.log(`Found payment record ${paymentRecord.id} for invoice ${xenditInvoiceId}`);

      // --- b. Map Xendit Status to Internal Status ---
      const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);
      console.log(`Mapped Xendit status '${invoiceStatus}' to internal status '${internalPaymentStatus}'`);

      // --- c. Determine corresponding Reservation status ---
      let newReservationStatus: Status | undefined;
      if (internalPaymentStatus === Status.CONFIRMED) {
         newReservationStatus = Status.CONFIRMED; // Or PENDING_CONFIRMATION if further steps needed
      } else if (internalPaymentStatus === Status.CANCELLED) {
         newReservationStatus = Status.CANCELLED;
         // Note: If cancelling due to non-payment, consider incrementing availability.
         // This would require a transaction and data from the reservation.
      }
      // Add logic for other statuses if needed (e.g., FAILED -> CANCELLED or specific status)

      // --- d. Update Database Records Atomically ---
      await prisma.$transaction(async tx => {
         // Update Payment record with callback details
         await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
               xenditCallback: callbackData, // Store raw data for reference
               callbackStatus: invoiceStatus,
               paymentStatus: internalPaymentStatus,
               paidAt: callbackData.paidAt ? new Date(callbackData.paidAt) : paymentRecord.paidAt
            }
         });
         console.log(`Updated payment record ${paymentRecord.id} status to ${internalPaymentStatus}`);

         // Update Reservation status if determined
         if (newReservationStatus && paymentRecord.reservationId) {
            await tx.reservation.update({
               where: { id: paymentRecord.reservationId },
               data: {
                  orderStatus: newReservationStatus
               }
            });
            console.log(`Updated reservation ${paymentRecord.reservationId} status to ${newReservationStatus}`);
            // Optional: Trigger post-confirmation actions (e.g., send confirmation email) here or after transaction
         }
      });

      console.log(`Successfully processed Xendit callback for invoice ${xenditInvoiceId}`);
      // --- 6. Acknowledge Success ---
      return res.status(200).send(RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
   } catch (error: any) {
      console.error('Error processing Xendit callback:', error);

      return res.status(200).send(RESERVATION_ERROR_MESSAGES.WEBHOOK_ERROR_LOGGED);
   }
};

function mapXenditInvoiceStatusToInternal (xenditStatus: string): Status {
   switch (xenditStatus.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
         return Status.CONFIRMED;
      case 'EXPIRED':
      case 'FAILED':
         return Status.CANCELLED;
      case 'PENDING':
      default:
         return Status.PENDING_PAYMENT;
   }
}
