/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `PeakRate` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `isWholeUnit` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `_RoomReservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserReservation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roomTypeId,date]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `availableCount` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `PeakRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_roomId_fkey";

-- DropForeignKey
ALTER TABLE "PeakRate" DROP CONSTRAINT "PeakRate_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomReservation" DROP CONSTRAINT "_RoomReservation_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomReservation" DROP CONSTRAINT "_RoomReservation_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserReservation" DROP CONSTRAINT "_UserReservation_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserReservation" DROP CONSTRAINT "_UserReservation_B_fkey";

-- DropIndex
DROP INDEX "PeakRate_roomId_idx";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "isAvailable",
ADD COLUMN     "availableCount" INTEGER NOT NULL,
ADD COLUMN     "roomTypeId" TEXT NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PeakRate" DROP COLUMN "roomId",
ADD COLUMN     "roomTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "propertyId" TEXT NOT NULL,
ADD COLUMN     "roomTypeId" TEXT NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "basePrice",
DROP COLUMN "capacity",
DROP COLUMN "description",
DROP COLUMN "isWholeUnit",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "roomTypeId" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "_RoomReservation";

-- DropTable
DROP TABLE "_UserReservation";

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "isWholeUnit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomType_propertyId_idx" ON "RoomType"("propertyId");

-- CreateIndex
CREATE INDEX "RoomType_isWholeUnit_idx" ON "RoomType"("isWholeUnit");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_propertyId_name_key" ON "RoomType"("propertyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_propertyId_isWholeUnit_key" ON "RoomType"("propertyId", "isWholeUnit");

-- CreateIndex
CREATE INDEX "Availability_roomTypeId_idx" ON "Availability"("roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_roomTypeId_date_key" ON "Availability"("roomTypeId", "date");

-- CreateIndex
CREATE INDEX "PeakRate_roomTypeId_idx" ON "PeakRate"("roomTypeId");

-- CreateIndex
CREATE INDEX "Reservation_propertyId_idx" ON "Reservation"("propertyId");

-- CreateIndex
CREATE INDEX "Reservation_roomTypeId_idx" ON "Reservation"("roomTypeId");

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeakRate" ADD CONSTRAINT "PeakRate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
