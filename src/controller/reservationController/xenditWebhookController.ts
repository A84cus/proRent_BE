// controllers/xenditController.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../../prisma';
import { Status } from '@prisma/client';
import { XENDIT_WEBHOOK_TOKEN } from '../../config';
import {
   RESERVATION_ERROR_MESSAGES,
   RESERVATION_SUCCESS_MESSAGES
} from '../../constants/controllers/reservation/reservationMessages';

export const handleXenditInvoiceCallback = async (req: Request, res: Response) => {
   console.log('=== START: XENDIT WEBHOOK CALLBACK ===');
   console.log('DEBUG: [1] XENDIT_WEBHOOK_TOKEN value is:', XENDIT_WEBHOOK_TOKEN);
   console.log('DEBUG: [2] Received Xendit Invoice Callback at:', new Date().toISOString());

   // --- Log ALL incoming headers for maximum debugging ---
   console.log('DEBUG: [3] FULL INCOMING HEADERS:', JSON.stringify(req.headers, null, 2));

   // --- 1. Retrieve Raw Body and Signature ---
   const rawBody = (req as any).rawBody; // Provided by express.raw middleware
   const signature = req.get('Xendit-Signature');
   console.log('DEBUG: [4] Extracted Xendit-Signature header value is:', signature);
   console.log(
      'DEBUG: [5] Raw Body (first 200 chars):',
      rawBody ? rawBody.toString('utf8').substring(0, 200) : 'NO RAW BODY'
   );

   // --- 2. Basic Request Validation ---
   if (!XENDIT_WEBHOOK_TOKEN) {
      console.error('ERROR: [6] XENDIT_WEBHOOK_TOKEN is not configured.');
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
   }

   if (!signature) {
      console.warn('WARNING: [7] Missing Xendit-Signature header. Full headers were logged above.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
   }

   if (!rawBody) {
      console.warn('WARNING: [8] Missing request body.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
   }

   // --- 3. Verify Webhook Signature ---
   try {
      console.log('DEBUG: [9] Starting signature verification process.');
      const expectedSignature = crypto.createHmac('sha256', XENDIT_WEBHOOK_TOKEN).update(rawBody, 'utf8').digest('hex');

      console.log('DEBUG: [10] Computed Expected Signature:', expectedSignature);
      console.log('DEBUG: [11] Received Signature from Header:', signature);

      const trusted = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));

      if (!trusted) {
         console.warn('WARNING: [12] SIGNATURE MISMATCH!');
         console.warn('WARNING: [13] Expected:', expectedSignature);
         console.warn('WARNING: [14] Received:', signature);
         return res.status(401).send(RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
      }
      console.log('SUCCESS: [15] Xendit webhook signature verified.');
   } catch (verifyError: any) {
      console.error('ERROR: [16] Error during signature verification:', verifyError);
      console.error('ERROR: [17] Stack Trace:', verifyError.stack);
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
   }

   // --- 4. Parse and Validate Callback Payload ---
   let callbackData: any;
   try {
      callbackData = JSON.parse(rawBody.toString('utf8'));
      console.log('SUCCESS: [18] Parsed callback data successfully:', JSON.stringify(callbackData, null, 2));
   } catch (parseError: any) {
      console.error('ERROR: [19] Error parsing Xendit callback JSON:', parseError);
      console.error('ERROR: [20] Raw Body that failed to parse:', rawBody.toString('utf8'));
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
   }

   const xenditInvoiceId = callbackData.id;
   const invoiceStatus = callbackData.status;

   if (!xenditInvoiceId) {
      console.warn('WARNING: [21] Callback payload missing invoice ID.');
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
   }

   console.log('DEBUG: [22] Processing invoice ID:', xenditInvoiceId, 'with status:', invoiceStatus);

   // --- 5. Process the Callback ---
   try {
      // --- a. Find the corresponding Payment record ---
      console.log('DEBUG: [23] Querying database for Payment with xenditInvoiceId:', xenditInvoiceId);
      const paymentRecord = await prisma.payment.findUnique({
         where: { xenditInvoiceId },
         include: {
            reservation: true
         }
      });

      if (!paymentRecord) {
         console.warn(`WARNING: [24] Payment record NOT FOUND for Xendit invoice ID: ${xenditInvoiceId}`);
         return res.status(200).send(RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
      }

      console.log(`SUCCESS: [25] Found payment record ${paymentRecord.id} for invoice ${xenditInvoiceId}`);

      // --- b. Map Xendit Status to Internal Status ---
      const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);
      console.log(`DEBUG: [26] Mapped Xendit status '${invoiceStatus}' to internal status '${internalPaymentStatus}'`);

      // --- c. Determine corresponding Reservation status ---
      let newReservationStatus: Status | undefined;
      if (internalPaymentStatus === Status.CONFIRMED) {
         newReservationStatus = Status.CONFIRMED;
      } else if (internalPaymentStatus === Status.CANCELLED) {
         newReservationStatus = Status.CANCELLED;
      }

      // --- d. Update Database Records Atomically ---
      console.log('DEBUG: [27] Starting database transaction to update records.');
      await prisma.$transaction(async tx => {
         await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
               xenditCallback: callbackData,
               callbackStatus: invoiceStatus,
               paymentStatus: internalPaymentStatus,
               paidAt: callbackData.paidAt ? new Date(callbackData.paidAt) : paymentRecord.paidAt
            }
         });
         console.log(`SUCCESS: [28] Updated payment record ${paymentRecord.id} status to ${internalPaymentStatus}`);

         if (newReservationStatus && paymentRecord.reservationId) {
            await tx.reservation.update({
               where: { id: paymentRecord.reservationId },
               data: {
                  orderStatus: newReservationStatus
               }
            });
            console.log(
               `SUCCESS: [29] Updated reservation ${paymentRecord.reservationId} status to ${newReservationStatus}`
            );
         }
      });

      console.log(`SUCCESS: [30] Successfully processed Xendit callback for invoice ${xenditInvoiceId}`);
      return res.status(200).send(RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
   } catch (error: any) {
      console.error('CRITICAL ERROR: [31] Error processing Xendit callback:', error);
      console.error('CRITICAL ERROR: [32] Error Stack:', error.stack);
      return res.status(200).send(RESERVATION_ERROR_MESSAGES.WEBHOOK_ERROR_LOGGED);
   } finally {
      console.log('=== END: XENDIT WEBHOOK CALLBACK ===\n\n');
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
