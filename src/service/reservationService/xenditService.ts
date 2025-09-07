// services/xenditService.ts

import Xendit from 'xendit-node';
import prisma from '../../prisma';
import { Status } from '@prisma/client';
import { BASE_FE_URL, BASE_FE_URL_ALT, XENDIT_SECRET_KEY } from '../../config/index';
import { InvoiceCurrency } from 'xendit-node/invoice/models';

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY! });
const { Invoice } = xenditClient;

export async function createXenditInvoice (paymentId: string) {
   const paymentRecord = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
         reservation: {
            include: {
               User: {
                  include: {
                     profile: true
                  }
               },
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

   // --- Use the Invoice API structure ---
   const invoiceData = {
      externalId: `invoice-${paymentRecord.id}-${Date.now()}`,
      amount: paymentRecord.amount,
      currency: 'IDR' as InvoiceCurrency,
      description: `Booking for ${roomType?.name || 'Accommodation'} at ${
         property?.name || 'Property'
      } from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
      // --- Customer Information ---
      customer: {
         given_names: user.profile?.firstName || user.email?.split('@')[0] || 'Guest',
         surname: user.profile?.lastName || '',
         email: user.email || paymentRecord.payerEmail || '',
         mobile_number: user.profile?.phone || ''
      },
      // --- Redirect URLs ---
      success_redirect_url: `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`,
      failure_redirect_url: `${BASE_FE_URL || BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`,
      // --- Items ---
      items: [
         {
            name: `${roomType?.name || 'Accommodation'} at ${property?.name || 'Property'}`,
            quantity: 1,
            price: paymentRecord.amount,
            category: 'Accommodation',
            url: `${BASE_FE_URL || BASE_FE_URL_ALT}/property/${property?.id}`
         }
      ],
      // --- Metadata ---
      metadata: {
         reservationId: reservation.id,
         propertyId: property?.id,
         roomTypeId: roomType?.id,
         userId: user.id
      },
      // --- Invoice Duration (24 hours) ---
      invoice_duration: 86400
   };

   try {
      console.log('DEBUG: Creating Xendit Invoice with ', JSON.stringify(invoiceData, null, 2));

      // --- Use Invoice.createInvoice for Invoice API ---
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
