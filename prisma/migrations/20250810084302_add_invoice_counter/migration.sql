-- CreateTable
CREATE TABLE "Prorent"."invoiceCounter" (
    "dateKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoiceCounter_pkey" PRIMARY KEY ("dateKey")
);
