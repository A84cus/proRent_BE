-- AlterTable
ALTER TABLE "Prorent"."PropertyPerformanceSummary" ADD COLUMN     "cancelledCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "confirmedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingConfirmationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingPaymentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projectedRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Prorent"."RoomTypePerformanceSummary" ADD COLUMN     "cancelledCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "confirmedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingConfirmationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingPaymentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projectedRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0;
