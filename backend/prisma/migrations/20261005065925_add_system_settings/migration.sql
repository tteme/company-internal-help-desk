-- CreateEnum
CREATE TYPE "SystemSettingType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER', 'ENUM');

-- CreateEnum
CREATE TYPE "SystemSettingCategory" AS ENUM ('GENERAL', 'REQUEST', 'NOTIFICATION', 'SECURITY', 'SYSTEM');

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SystemSettingType" NOT NULL,
    "category" "SystemSettingCategory" NOT NULL,
    "description" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");
