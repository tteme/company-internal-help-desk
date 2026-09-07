-- DropIndex
DROP INDEX "RequestSla_responseDueAt_idx";

-- DropIndex
DROP INDEX "RequestSla_slaPolicyId_idx";

-- AlterTable
ALTER TABLE "BusinessHours" ADD COLUMN     "breakEndTime" TEXT,
ADD COLUMN     "breakStartTime" TEXT;

-- AlterTable
ALTER TABLE "RequestSla" ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "warningAt" TIMESTAMP(3),
ADD COLUMN     "warningSentAt" TIMESTAMP(3),
ALTER COLUMN "responseDueAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "RequestSla_warningAt_idx" ON "RequestSla"("warningAt");

-- CreateIndex
CREATE INDEX "RequestSla_resolutionBreached_idx" ON "RequestSla"("resolutionBreached");
