-- AlterTable
ALTER TABLE "Prorent"."Payment" ADD COLUMN     "xenditInvoiceId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_xenditInvoiceId_idx" ON "Prorent"."Payment"("xenditInvoiceId");
