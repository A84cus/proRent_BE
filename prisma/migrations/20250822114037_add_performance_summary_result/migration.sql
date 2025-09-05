-- CreateTable
CREATE TABLE "Prorent"."PropertyPerformanceSummary" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "totalRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalReservations" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyPerformanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prorent"."RoomTypePerformanceSummary" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "totalRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalReservations" INTEGER NOT NULL DEFAULT 0,
    "totalNightsBooked" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomTypePerformanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_propertyId_idx" ON "Prorent"."PropertyPerformanceSummary"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_year_month_idx" ON "Prorent"."PropertyPerformanceSummary"("year", "month");

-- CreateIndex
CREATE INDEX "PropertyPerformanceSummary_periodType_periodKey_idx" ON "Prorent"."PropertyPerformanceSummary"("periodType", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPerformanceSummary_propertyId_periodType_periodKey_key" ON "Prorent"."PropertyPerformanceSummary"("propertyId", "periodType", "periodKey");

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_roomTypeId_idx" ON "Prorent"."RoomTypePerformanceSummary"("roomTypeId");

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_propertyId_idx" ON "Prorent"."RoomTypePerformanceSummary"("propertyId");

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_year_month_idx" ON "Prorent"."RoomTypePerformanceSummary"("year", "month");

-- CreateIndex
CREATE INDEX "RoomTypePerformanceSummary_periodType_periodKey_idx" ON "Prorent"."RoomTypePerformanceSummary"("periodType", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "RoomTypePerformanceSummary_roomTypeId_periodType_periodKey_key" ON "Prorent"."RoomTypePerformanceSummary"("roomTypeId", "periodType", "periodKey");

-- AddForeignKey
ALTER TABLE "Prorent"."PropertyPerformanceSummary" ADD CONSTRAINT "PropertyPerformanceSummary_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Prorent"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prorent"."RoomTypePerformanceSummary" ADD CONSTRAINT "RoomTypePerformanceSummary_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "Prorent"."RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prorent"."RoomTypePerformanceSummary" ADD CONSTRAINT "RoomTypePerformanceSummary_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Prorent"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
