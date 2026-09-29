-- CreateEnum
CREATE TYPE "ClientFeedbackStatus" AS ENUM ('PENDING_REVIEW', 'ASSIGNED', 'IN_REVIEW', 'ADDRESSED', 'DISMISSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CLIENT_FEEDBACK_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'CLIENT_FEEDBACK_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'CLIENT_FEEDBACK_UPDATE';
ALTER TYPE "NotificationType" ADD VALUE 'CLIENT_FEEDBACK_ADDRESSED';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "feedbackId" TEXT;

-- CreateTable
CREATE TABLE "ClientFeedback" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ClientFeedbackStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "departmentId" TEXT,
    "assignedToId" TEXT,
    "assignedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFeedbackUpdate" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFeedbackUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientFeedback_referenceNumber_key" ON "ClientFeedback"("referenceNumber");

-- CreateIndex
CREATE INDEX "ClientFeedback_status_idx" ON "ClientFeedback"("status");

-- CreateIndex
CREATE INDEX "ClientFeedback_departmentId_idx" ON "ClientFeedback"("departmentId");

-- CreateIndex
CREATE INDEX "ClientFeedback_assignedToId_idx" ON "ClientFeedback"("assignedToId");

-- CreateIndex
CREATE INDEX "ClientFeedback_assignedById_idx" ON "ClientFeedback"("assignedById");

-- CreateIndex
CREATE INDEX "ClientFeedback_createdAt_idx" ON "ClientFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "ClientFeedbackUpdate_feedbackId_idx" ON "ClientFeedbackUpdate"("feedbackId");

-- CreateIndex
CREATE INDEX "ClientFeedbackUpdate_userId_idx" ON "ClientFeedbackUpdate"("userId");

-- CreateIndex
CREATE INDEX "ClientFeedbackUpdate_createdAt_idx" ON "ClientFeedbackUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_feedbackId_idx" ON "Notification"("feedbackId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "ClientFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFeedbackUpdate" ADD CONSTRAINT "ClientFeedbackUpdate_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "ClientFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFeedbackUpdate" ADD CONSTRAINT "ClientFeedbackUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
