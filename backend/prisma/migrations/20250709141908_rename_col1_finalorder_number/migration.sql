/*
  Warnings:

  - You are about to drop the column `col1` on the `ExcelOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExcelOrder" DROP COLUMN "col1",
ADD COLUMN     "finalorderNumber" TEXT;
