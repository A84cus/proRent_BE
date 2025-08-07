/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `TenantReply` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `OwnerId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prorent"."Property" DROP CONSTRAINT "Property_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Prorent"."TenantReply" DROP CONSTRAINT "TenantReply_reviewId_fkey";

-- DropIndex
DROP INDEX "Prorent"."Property_tenantId_idx";

-- AlterTable
ALTER TABLE "Prorent"."Property" DROP COLUMN "tenantId",
ADD COLUMN     "OwnerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Prorent"."TenantReply";

-- CreateTable
CREATE TABLE "Prorent"."OwnerReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OwnerReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerReply_reviewId_key" ON "Prorent"."OwnerReply"("reviewId");

-- CreateIndex
CREATE INDEX "Property_OwnerId_idx" ON "Prorent"."Property"("OwnerId");

-- AddForeignKey
ALTER TABLE "Prorent"."Property" ADD CONSTRAINT "Property_OwnerId_fkey" FOREIGN KEY ("OwnerId") REFERENCES "Prorent"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prorent"."OwnerReply" ADD CONSTRAINT "OwnerReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Prorent"."Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
