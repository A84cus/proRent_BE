/*
  Warnings:

  - Added the required column `OwnerId` to the `RoomTypePerformanceSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prorent"."RoomTypePerformanceSummary" ADD COLUMN     "OwnerId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_OwnerId_periodType_periodKey_idx" ON "Prorent"."RoomTypePerformanceSummary"("OwnerId", "periodType", "periodKey");

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_OwnerId_periodType_periodKey_pro_idx" ON "Prorent"."RoomTypePerformanceSummary"("OwnerId", "periodType", "periodKey", "propertyId");
