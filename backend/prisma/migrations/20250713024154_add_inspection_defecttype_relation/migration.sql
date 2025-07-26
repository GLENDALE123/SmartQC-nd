-- CreateTable
CREATE TABLE "InspectionDefectType" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "defectTypeId" INTEGER NOT NULL,

    CONSTRAINT "InspectionDefectType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InspectionDefectType" ADD CONSTRAINT "InspectionDefectType_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionDefectType" ADD CONSTRAINT "InspectionDefectType_defectTypeId_fkey" FOREIGN KEY ("defectTypeId") REFERENCES "DefectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
