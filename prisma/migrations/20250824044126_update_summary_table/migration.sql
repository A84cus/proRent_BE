/*
  Warnings:

  - You are about to drop the column `ownerId` on the `PropertyPerformanceSummary` table. All the data in the column will be lost.
  - Added the required column `OwnerId` to the `PropertyPerformanceSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Prorent"."PropertyPerformanceSummary_ownerId_periodType_periodKey_idx";

-- DropIndex
DROP INDEX "Prorent"."PropertyPerformanceSummary_ownerId_periodType_periodKey_pro_idx";

-- AlterTable
ALTER TABLE "Prorent"."PropertyPerformanceSummary" DROP COLUMN "ownerId",
ADD COLUMN     "OwnerId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_OwnerId_periodType_periodKey_idx" ON "Prorent"."PropertyPerformanceSummary"("OwnerId", "periodType", "periodKey");

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_OwnerId_periodType_periodKey_pro_idx" ON "Prorent"."PropertyPerformanceSummary"("OwnerId", "periodType", "periodKey", "propertyId");
