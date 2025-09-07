// services/xenditService.ts

import Xendit from 'xendit-node';
import prisma from '../../prisma';
import { Status } from '@prisma/client';
import { BASE_FE_URL, BASE_FE_URL_ALT, XENDIT_SECRET_KEY } from '../../config/index';
import { PaymentRequestBasketItem, PaymentRequestCurrency } from 'xendit-node/payment_request/models';

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY! });
const { PaymentRequest } = xenditClient; // Use PaymentRequest for the v2 structure

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

   // --- Use the Payment Request API v2 structure ---
   const paymentRequestData = {
      reference_id: `invoice-${paymentRecord.id}-${Date.now()}`,
      amount: paymentRecord.amount,
      currency: 'IDR' as PaymentRequestCurrency,
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
      // --- Redirect URLs (Top-level for Payment Request v2) ---
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
      ] as PaymentRequestBasketItem[],
      // --- Metadata ---
      metadata: {
         reservationId: reservation.id,
         propertyId: property?.id,
         roomTypeId: roomType?.id,
         userId: user.id
      }
   };

   try {
      console.log('DEBUG: Creating Xendit Payment Request with ', JSON.stringify(paymentRequestData, null, 2));

      // --- Use the correct method: createPaymentRequest ---
      const xenditPaymentRequest = await PaymentRequest.createPaymentRequest({ data: paymentRequestData });
      console.log('Xendit Payment Request Created:', xenditPaymentRequest.id);

      // --- Extract the web URL from the actions array ---
      const webAction = xenditPaymentRequest.actions?.find(action => action.urlType === 'WEB');
      const paymentUrl = webAction
         ? webAction.url
         : xenditPaymentRequest.actions &&
           xenditPaymentRequest.actions[0] &&
           xenditPaymentRequest.actions[0].urlType === 'WEB'
         ? xenditPaymentRequest.actions[0].url
         : undefined;
      if (!paymentUrl) {
         throw new Error('No payment URL found in Xendit response');
      }

      await prisma.payment.update({
         where: { id: paymentId },
         data: {
            xenditInvoiceId: xenditPaymentRequest.id,
            externalInvoiceUrl: paymentUrl
         }
      });

      return {
         invoiceId: xenditPaymentRequest.id,
         invoiceUrl: paymentUrl
      };
   } catch (error: any) {
      console.error('Error creating Xendit Payment Request:', error);
      await prisma.transactionLog.create({
         data: {
            paymentId,
            status: 'XENDIT_INVOICE_ERROR',
            message: error.message || 'Unknown error creating Xendit payment request'
         }
      });
      throw new Error(`Failed to create Xendit payment request: ${error.message}`);
   }
}
