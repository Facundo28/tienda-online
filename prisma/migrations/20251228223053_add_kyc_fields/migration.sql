/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "dni" TEXT;
ALTER TABLE "User" ADD COLUMN "documentBackUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "documentFrontUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");
