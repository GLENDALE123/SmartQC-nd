/*
  Warnings:

  - Added the required column `batchId` to the `Inspection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "batchId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InspectionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
