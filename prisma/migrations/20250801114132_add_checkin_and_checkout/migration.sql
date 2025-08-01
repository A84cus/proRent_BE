-- AlterTable
ALTER TABLE "PeakRate" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "CheckinAt" TIMESTAMP(3),
ADD COLUMN     "CheckoutAt" TIMESTAMP(3);
