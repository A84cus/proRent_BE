/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Property` table. All the data in the column will be lost.
  - Added the required column `OwnerId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prorent"."Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- DropIndex
DROP INDEX "Prorent"."Property_ownerId_idx";

-- AlterTable
ALTER TABLE "Prorent"."Property" DROP COLUMN "ownerId",
ADD COLUMN     "OwnerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Property_OwnerId_idx" ON "Prorent"."Property"("OwnerId");

-- AddForeignKey
ALTER TABLE "Prorent"."Property" ADD CONSTRAINT "Property_OwnerId_fkey" FOREIGN KEY ("OwnerId") REFERENCES "Prorent"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
