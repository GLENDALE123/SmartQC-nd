/*
  Warnings:

  - You are about to drop the `Inspection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InspectionDefectType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `DefectType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_inspectorId_fkey";

-- DropForeignKey
ALTER TABLE "InspectionDefectType" DROP CONSTRAINT "InspectionDefectType_defectTypeId_fkey";

-- DropForeignKey
ALTER TABLE "InspectionDefectType" DROP CONSTRAINT "InspectionDefectType_inspectionId_fkey";

-- DropTable
DROP TABLE "Inspection";

-- DropTable
DROP TABLE "InspectionDefectType";

-- CreateTable
CREATE TABLE "IncomingInspection" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "defectQty" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingInspectionDefect" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "defectTypeId" INTEGER,
    "customType" TEXT,
    "count" INTEGER NOT NULL,
    "details" JSONB,

    CONSTRAINT "IncomingInspectionDefect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessInspection" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "defectQty" INTEGER NOT NULL,
    "notes" TEXT,
    "paintPrimer" TEXT,
    "paintTopcoat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessInspectionRound" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "ProcessInspectionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessInspectionDefect" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "defectTypeId" INTEGER,
    "customType" TEXT,
    "count" INTEGER NOT NULL,
    "details" JSONB,

    CONSTRAINT "ProcessInspectionDefect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentInspection" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "defectQty" INTEGER NOT NULL,
    "notes" TEXT,
    "finalPeeling" TEXT,
    "externalCheck" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentInspectionRound" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "qty" INTEGER NOT NULL,
    "defectQty" INTEGER NOT NULL,

    CONSTRAINT "ShipmentInspectionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentInspectionWorker" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ShipmentInspectionWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentInspectionDefect" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "defectTypeId" INTEGER,
    "customType" TEXT,
    "count" INTEGER NOT NULL,
    "details" JSONB,

    CONSTRAINT "ShipmentInspectionDefect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incomingInspectionId" INTEGER,
    "processInspectionId" INTEGER,
    "shipmentInspectionId" INTEGER,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncomingInspection_batchId_key" ON "IncomingInspection"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessInspection_batchId_key" ON "ProcessInspection"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentInspection_batchId_key" ON "ShipmentInspection"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "DefectType_name_key" ON "DefectType"("name");

-- AddForeignKey
ALTER TABLE "IncomingInspection" ADD CONSTRAINT "IncomingInspection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InspectionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingInspectionDefect" ADD CONSTRAINT "IncomingInspectionDefect_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "IncomingInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingInspectionDefect" ADD CONSTRAINT "IncomingInspectionDefect_defectTypeId_fkey" FOREIGN KEY ("defectTypeId") REFERENCES "DefectType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInspection" ADD CONSTRAINT "ProcessInspection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InspectionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInspectionRound" ADD CONSTRAINT "ProcessInspectionRound_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ProcessInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInspectionDefect" ADD CONSTRAINT "ProcessInspectionDefect_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ProcessInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessInspectionDefect" ADD CONSTRAINT "ProcessInspectionDefect_defectTypeId_fkey" FOREIGN KEY ("defectTypeId") REFERENCES "DefectType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentInspection" ADD CONSTRAINT "ShipmentInspection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InspectionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentInspectionRound" ADD CONSTRAINT "ShipmentInspectionRound_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ShipmentInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentInspectionWorker" ADD CONSTRAINT "ShipmentInspectionWorker_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ShipmentInspectionRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentInspectionDefect" ADD CONSTRAINT "ShipmentInspectionDefect_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "ShipmentInspectionWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentInspectionDefect" ADD CONSTRAINT "ShipmentInspectionDefect_defectTypeId_fkey" FOREIGN KEY ("defectTypeId") REFERENCES "DefectType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incomingInspectionId_fkey" FOREIGN KEY ("incomingInspectionId") REFERENCES "IncomingInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_processInspectionId_fkey" FOREIGN KEY ("processInspectionId") REFERENCES "ProcessInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_shipmentInspectionId_fkey" FOREIGN KEY ("shipmentInspectionId") REFERENCES "ShipmentInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
