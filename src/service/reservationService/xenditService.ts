// services/xenditService.ts
import Xendit from 'xendit-node'; // Or import axios if not using SDK
import prisma from '../../prisma'; // Adjust path
import { Status } from '@prisma/client';

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
const { Invoice } = xenditClient;

export async function createXenditInvoice (paymentId: string) {
   const paymentRecord = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
         reservation: {
            include: {
               User: true, // Need user email
               RoomType: true, // Need room type name for description
               Property: true // Need property name for description
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

   // Prepare invoice data for Xendit
   const invoiceData = {
      externalId: `invoice-${paymentRecord.id}-${Date.now()}`, // Unique ID for Xendit
      amount: paymentRecord.amount,
      payerEmail: user.email || paymentRecord.payerEmail || '', // Prefer user email
      description: `Booking for ${reservation.RoomType?.name || 'Room'} at ${
         reservation.Property?.name || 'Property'
      } from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
      invoiceDuration: 60 * 60 * 24, // 24 hours in seconds (adjust as needed, relates to expiresAt)
      successRedirectURL: `${process.env.FRONTEND_BASE_URL}/booking/success?reservationId=${reservation.id}`, // Optional
      failureRedirectURL: `${process.env.FRONTEND_BASE_URL}/booking/failure?reservationId=${reservation.id}`, // Optional
      callbackVirtualAccountID: undefined // Use if you have Virtual Accounts set up
      // Add other Xendit options as needed (e.g., currency, reminder time)
   };

   try {
      const xenditInvoice = await Invoice.createInvoice({ data: invoiceData });
      console.log('Xendit Invoice Created:', xenditInvoice.id);

      // Update your Payment record with Xendit invoice details
      await prisma.payment.update({
         where: { id: paymentId },
         data: {
            xenditInvoiceId: xenditInvoice.id, // Store Xendit's Invoice ID
            externalInvoiceUrl: xenditInvoice.invoiceUrl // Store the payment link
            // Optionally update other fields if needed immediately
         }
      });

      return {
         invoiceId: xenditInvoice.id,
         invoiceUrl: xenditInvoice.invoiceUrl
      };
   } catch (error: any) {
      console.error('Error creating Xendit Invoice:', error);
      // Log error to TransactionLog or handle appropriately
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
