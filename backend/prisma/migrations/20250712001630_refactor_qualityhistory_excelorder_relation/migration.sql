/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `hasDefects` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `partName` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `QualityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `QualityHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExcelOrder" ADD COLUMN     "qualityHistoryId" INTEGER;

-- AlterTable
ALTER TABLE "QualityHistory" DROP COLUMN "assignedTo",
DROP COLUMN "customerName",
DROP COLUMN "hasDefects",
DROP COLUMN "orderId",
DROP COLUMN "orderNumber",
DROP COLUMN "partName",
DROP COLUMN "productName",
DROP COLUMN "specifications",
DROP COLUMN "status";

-- AddForeignKey
ALTER TABLE "ExcelOrder" ADD CONSTRAINT "ExcelOrder_qualityHistoryId_fkey" FOREIGN KEY ("qualityHistoryId") REFERENCES "QualityHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
