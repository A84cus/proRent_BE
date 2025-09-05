-- CreateTable
CREATE TABLE "Prorent"."TransactionLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionLog_paymentId_idx" ON "Prorent"."TransactionLog"("paymentId");

-- AddForeignKey
ALTER TABLE "Prorent"."TransactionLog" ADD CONSTRAINT "TransactionLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Prorent"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
