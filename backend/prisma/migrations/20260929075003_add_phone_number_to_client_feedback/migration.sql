-- Add the column temporarily as nullable
ALTER TABLE "ClientFeedback"
ADD COLUMN "phoneNumber" TEXT;

-- Give existing feedback records a placeholder value
UPDATE "ClientFeedback"
SET "phoneNumber" = 'N/A'
WHERE "phoneNumber" IS NULL;

-- Make the column required
ALTER TABLE "ClientFeedback"
ALTER COLUMN "phoneNumber" SET NOT NULL;