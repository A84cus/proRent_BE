/*
  Warnings:

  - Added the required column `ownerId` to the `PropertyPerformanceSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prorent"."PropertyPerformanceSummary" ADD COLUMN     "ownerId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_ownerId_periodType_periodKey_idx" ON "Prorent"."PropertyPerformanceSummary"("ownerId", "periodType", "periodKey");

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_ownerId_periodType_periodKey_pro_idx" ON "Prorent"."PropertyPerformanceSummary"("ownerId", "periodType", "periodKey", "propertyId");
