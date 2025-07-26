/*
  Warnings:

  - The primary key for the `ExcelOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ExcelOrder` table. All the data in the column will be lost.
  - Made the column `col0` on table `ExcelOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ExcelOrder" DROP CONSTRAINT "ExcelOrder_pkey",
DROP COLUMN "id",
ALTER COLUMN "col0" SET NOT NULL,
ADD CONSTRAINT "ExcelOrder_pkey" PRIMARY KEY ("col0");
