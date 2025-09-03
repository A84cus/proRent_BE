/*
  Warnings:

  - The values [PENDING_PAYMENT,PENDING_CONFIRMATION] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Prorent"."Status_new" AS ENUM ('DRAFT', 'WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" TYPE "Prorent"."Status_new" USING ("orderStatus"::text::"Prorent"."Status_new");
ALTER TABLE "Prorent"."Payment" ALTER COLUMN "paymentStatus" TYPE "Prorent"."Status_new" USING ("paymentStatus"::text::"Prorent"."Status_new");
ALTER TYPE "Prorent"."Status" RENAME TO "Status_old";
ALTER TYPE "Prorent"."Status_new" RENAME TO "Status";
DROP TYPE "Prorent"."Status_old";
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" SET DEFAULT 'WAITING_PAYMENT';
COMMIT;

-- AlterTable
ALTER TABLE "Prorent"."Reservation" ALTER COLUMN "orderStatus" SET DEFAULT 'WAITING_PAYMENT';
