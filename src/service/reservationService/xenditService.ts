// services/xenditService.ts
import Xendit from 'xendit-node';
import prisma from '../../prisma'; // Adjust path
import { Status } from '@prisma/client';
import { BASE_FE_URL, BASE_FE_URL_ALT, XENDIT_SECRET_KEY } from '../../config/index'; // Assuming you use this for env vars

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY! });
const { Invoice } = xenditClient;

export async function createXenditInvoice (paymentId: string) {
   const paymentRecord = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
         reservation: {
            include: {
               User: true,
               RoomType: true,
               Property: true
            }
         }
      }
   });

   if (!paymentRecord || paymentRecord.method !== 'XENDIT') {
      throw new Error('Invalid payment record for Xendit invoice creation.');
   }

   if (!paymentRecord.reservation || !paymentRecord.reservation.User) {
      throw new Error('Reservation or user data missing for Xendit invoice.');
   }

   const reservation = paymentRecord.reservation;
   const user = reservation.User;
   const roomType = reservation.RoomType;
   const property = reservation.Property;

   const invoiceData = {
      externalId: `invoice-${paymentRecord.id}-${Date.now()}`, // Unique ID for Xendit
      amount: paymentRecord.amount,
      payerEmail: user.email || paymentRecord.payerEmail || '', // Prefer user email from relation
      description: `Booking for ${roomType?.name || 'Accommodation'} at ${
         property?.name || 'Property'
      } from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
      invoiceDuration: 60 * 60 * 24,
      successRedirectURL: `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`,
      failureRedirectURL: `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`
   };

   try {
      console.log(
         'DEBUG: Success Redirect URL:',
         `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`
      );
      console.log(
         'DEBUG: Failure Redirect URL:',
         `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`
      );

      const xenditInvoice = await Invoice.createInvoice({ data: invoiceData });
      console.log('Xendit Invoice Created:', xenditInvoice.id);

      await prisma.payment.update({
         where: { id: paymentId },
         data: {
            xenditInvoiceId: xenditInvoice.id,
            externalInvoiceUrl: xenditInvoice.invoiceUrl
         }
      });

      return {
         invoiceId: xenditInvoice.id,
         invoiceUrl: xenditInvoice.invoiceUrl
      };
   } catch (error: any) {
      console.error('Error creating Xendit Invoice:', error);
      await prisma.transactionLog.create({
         data: {
            paymentId,
            status: 'XENDIT_INVOICE_ERROR',
            message: error.message || 'Unknown error creating Xendit invoice'
         }
      });
      throw new Error(`Failed to create Xendit invoice: ${error.message}`);
   }
}
