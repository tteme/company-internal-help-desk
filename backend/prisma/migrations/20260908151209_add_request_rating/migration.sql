-- CreateTable
CREATE TABLE "RequestRating" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestRating_employeeId_idx" ON "RequestRating"("employeeId");

-- CreateIndex
CREATE INDEX "RequestRating_rating_idx" ON "RequestRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "RequestRating_requestId_key" ON "RequestRating"("requestId");

-- AddForeignKey
ALTER TABLE "RequestRating" ADD CONSTRAINT "RequestRating_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRating" ADD CONSTRAINT "RequestRating_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
