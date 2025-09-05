/*
  Warnings:

  - The values [DRAFT] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `EmailLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Prorent"."Status_new" AS ENUM ('PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" TYPE "Prorent"."Status_new" USING ("orderStatus"::text::"Prorent"."Status_new");
ALTER TABLE "Prorent"."Payment" ALTER COLUMN "paymentStatus" TYPE "Prorent"."Status_new" USING ("paymentStatus"::text::"Prorent"."Status_new");
ALTER TYPE "Prorent"."Status" RENAME TO "Status_old";
ALTER TYPE "Prorent"."Status_new" RENAME TO "Status";
DROP TYPE "Prorent"."Status_old";
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING_PAYMENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Prorent"."TransactionLog" DROP CONSTRAINT "TransactionLog_paymentId_fkey";

-- DropTable
DROP TABLE "Prorent"."EmailLog";

-- DropTable
DROP TABLE "Prorent"."TransactionLog";

-- DropEnum
DROP TYPE "Prorent"."EmailStatus";

-- DropEnum
DROP TYPE "Prorent"."EmailTemplate";
