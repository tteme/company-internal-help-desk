/*
  Warnings:

  - You are about to drop the column `fromDepartmentId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `toDepartmentId` on the `Request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_fromDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_toDepartmentId_fkey";

-- DropIndex
DROP INDEX "Request_fromDepartmentId_idx";

-- DropIndex
DROP INDEX "Request_toDepartmentId_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "fromDepartmentId",
DROP COLUMN "toDepartmentId";

-- AlterTable
ALTER TABLE "RequestEscalation" ADD COLUMN     "fromDepartmentId" TEXT,
ADD COLUMN     "toDepartmentId" TEXT;

-- CreateIndex
CREATE INDEX "RequestEscalation_fromDepartmentId_idx" ON "RequestEscalation"("fromDepartmentId");

-- CreateIndex
CREATE INDEX "RequestEscalation_toDepartmentId_idx" ON "RequestEscalation"("toDepartmentId");

-- AddForeignKey
ALTER TABLE "RequestEscalation" ADD CONSTRAINT "RequestEscalation_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestEscalation" ADD CONSTRAINT "RequestEscalation_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
