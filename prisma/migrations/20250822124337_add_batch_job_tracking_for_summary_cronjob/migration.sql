-- CreateEnum
CREATE TYPE "Prorent"."JobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Prorent"."BatchJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "Prorent"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "targetOwnerId" TEXT,
    "targetPeriodType" TEXT,
    "targetPeriodKey" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchJob_jobType_status_idx" ON "Prorent"."BatchJob"("jobType", "status");

-- CreateIndex
CREATE INDEX "BatchJob_targetOwnerId_idx" ON "Prorent"."BatchJob"("targetOwnerId");

-- CreateIndex
CREATE INDEX "BatchJob_createdAt_idx" ON "Prorent"."BatchJob"("createdAt");

-- CreateIndex
CREATE INDEX "BatchJob_status_idx" ON "Prorent"."BatchJob"("status");
