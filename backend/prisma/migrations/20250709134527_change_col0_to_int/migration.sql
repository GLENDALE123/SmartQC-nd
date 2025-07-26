/*
  Warnings:

  - The primary key for the `ExcelOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `col0` on the `ExcelOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ExcelOrder" DROP CONSTRAINT "ExcelOrder_pkey",
DROP COLUMN "col0",
ADD COLUMN     "col0" INTEGER NOT NULL,
ADD CONSTRAINT "ExcelOrder_pkey" PRIMARY KEY ("col0");
