-- CreateEnum
CREATE TYPE "PropertyRentalType" AS ENUM ('WHOLE_PROPERTY', 'ROOM_BY_ROOM');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "rentalType" "PropertyRentalType" NOT NULL DEFAULT 'ROOM_BY_ROOM';

-- CreateIndex
CREATE INDEX "Property_rentalType_idx" ON "Property"("rentalType");
