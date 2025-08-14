// services/invoiceNumberGenerator.ts
import prisma from '../../prisma';

export async function generateInvoiceNumber (tx: any): Promise<string> {
   const today = new Date();
   const dateKey = today.toISOString().split('T')[0]; // e.g., "2025-04-05"

   // Get or create the counter for today
   const counterRecord = await tx.invoiceCounter.upsert({
      where: { dateKey },
      update: { counter: { increment: 1 } },
      create: { dateKey, counter: 1 }
   });

   const incrementedCounter = counterRecord.counter;

   const year = today.getFullYear();
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const day = String(today.getDate()).padStart(2, '0');
   const serial = String(incrementedCounter).padStart(3, '0');

   return `INV-${year}/${month}/${day}-${serial}`;
}

export function extractSerialFromInvoiceNumber (invoiceNumber: string): number {
   const parts = invoiceNumber.split('-');
   if (parts.length === 2) {
      return parseInt(parts[1], 10);
   }
   return 1;
}
