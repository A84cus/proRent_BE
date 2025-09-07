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
   // --- 1. Retrieve Raw Body and Token ---
   const rawBody = (req as any).rawBody;
   const callbackToken = req.get('X-CALLBACK-TOKEN');

   // --- 2. Basic Request Validation ---
   if (!XENDIT_WEBHOOK_TOKEN) {
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
   }

   if (!callbackToken) {
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
   }

   if (!rawBody) {
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
   }

   // --- 3. Verify Webhook Token (Direct String Comparison) ---
   try {
      if (XENDIT_WEBHOOK_TOKEN !== callbackToken) {
         return res.status(401).send(RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
      }
   } catch (verifyError: any) {
      return res.status(500).send(RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
   }

   // --- 4. Parse and Validate Callback Payload ---
   let callbackData: any;
   try {
      // Convert the rawBody buffer to a string and parse JSON
      const bodyString = rawBody.toString('utf8');
      callbackData = JSON.parse(bodyString);
   } catch (parseError: any) {
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
   }

   const xenditInvoiceId = callbackData.id;
   const invoiceStatus = callbackData.status;

   if (!xenditInvoiceId) {
      return res.status(400).send(RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
   }

   // --- 5. Process the Callback ---
   try {
      // --- a. Find the corresponding Payment record ---
      const paymentRecord = await prisma.payment.findUnique({
         where: { xenditInvoiceId },
         include: {
            reservation: true
         }
      });

      if (!paymentRecord) {
         return res.status(200).send(RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
      }

      // --- b. Map Xendit Status to Internal Status ---
      const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);

      // --- c. Determine corresponding Reservation status ---
      let newReservationStatus: Status | undefined;
      if (internalPaymentStatus === Status.CONFIRMED) {
         newReservationStatus = Status.CONFIRMED;
      } else if (internalPaymentStatus === Status.CANCELLED) {
         newReservationStatus = Status.CANCELLED;
      }

      // --- d. Update Database Records Atomically ---
      await prisma.$transaction(async tx => {
         await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
               xenditCallback: callbackData, // Store raw data for reference
               callbackStatus: invoiceStatus,
               paymentStatus: internalPaymentStatus,
               paidAt: callbackData.paidAt ? new Date(callbackData.paidAt) : paymentRecord.paidAt
            }
         });

         if (newReservationStatus && paymentRecord.reservationId) {
            await tx.reservation.update({
               where: { id: paymentRecord.reservationId },
               data: { orderStatus: newReservationStatus }
            });
         }
      });

      return res.status(200).send(RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
   } catch (error: any) {
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
