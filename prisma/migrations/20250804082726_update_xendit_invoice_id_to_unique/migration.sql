/*
  Warnings:

  - A unique constraint covering the columns `[xenditInvoiceId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_xenditInvoiceId_key" ON "Prorent"."Payment"("xenditInvoiceId");
