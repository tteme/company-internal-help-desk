/*
  Warnings:

  - You are about to drop the column `assignedById` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `employeeConfirmed` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `employeeRejected` on the `Request` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OfficerAvailability" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'REOPENED';

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_assignedById_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "assignedById",
DROP COLUMN "employeeConfirmed",
DROP COLUMN "employeeRejected",
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "firstViewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" "OfficerAvailability" NOT NULL DEFAULT 'AVAILABLE',
ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';

-- CreateIndex
CREATE INDEX "User_availability_idx" ON "User"("availability");
