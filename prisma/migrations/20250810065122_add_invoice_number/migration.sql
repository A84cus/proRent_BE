/*
  Warnings:

  - Added the required column `invoiceNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prorent"."Payment" ADD COLUMN     "invoiceNumber" TEXT NOT NULL;
