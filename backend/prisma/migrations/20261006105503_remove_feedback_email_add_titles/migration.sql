/*
  Warnings:

  - You are about to drop the column `email` on the `ClientFeedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientFeedback" DROP COLUMN "email",
ADD COLUMN     "titleId" TEXT;

-- CreateTable
CREATE TABLE "ClientFeedbackTitle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFeedbackTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientFeedbackTitle_name_key" ON "ClientFeedbackTitle"("name");

-- CreateIndex
CREATE INDEX "ClientFeedbackTitle_isActive_idx" ON "ClientFeedbackTitle"("isActive");

-- CreateIndex
CREATE INDEX "ClientFeedback_titleId_idx" ON "ClientFeedback"("titleId");

-- AddForeignKey
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "ClientFeedbackTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
