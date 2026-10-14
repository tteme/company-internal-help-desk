-- AlterEnum
ALTER TYPE "EscalationReason" ADD VALUE 'CROSS_DEPARTMENT';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "fromDepartmentId" TEXT,
ADD COLUMN     "toDepartmentId" TEXT;

-- CreateIndex
CREATE INDEX "Request_fromDepartmentId_idx" ON "Request"("fromDepartmentId");

-- CreateIndex
CREATE INDEX "Request_toDepartmentId_idx" ON "Request"("toDepartmentId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
