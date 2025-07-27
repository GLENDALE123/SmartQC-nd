/*
  Warnings:

  - You are about to drop the column `batchId` on the `IncomingInspection` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `ProcessInspection` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `ShipmentInspection` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ExcelOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InspectionBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QualityHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExcelOrder" DROP CONSTRAINT "ExcelOrder_qualityHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "IncomingInspection" DROP CONSTRAINT "IncomingInspection_batchId_fkey";

-- DropForeignKey
ALTER TABLE "InspectionBatch" DROP CONSTRAINT "InspectionBatch_qualityHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessInspection" DROP CONSTRAINT "ProcessInspection_batchId_fkey";

-- DropForeignKey
ALTER TABLE "ShipmentInspection" DROP CONSTRAINT "ShipmentInspection_batchId_fkey";

-- DropIndex
DROP INDEX "IncomingInspection_batchId_key";

-- DropIndex
DROP INDEX "ProcessInspection_batchId_key";

-- DropIndex
DROP INDEX "ShipmentInspection_batchId_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "IncomingInspection" DROP COLUMN "batchId",
ADD COLUMN     "client" TEXT,
ADD COLUMN     "manager" TEXT,
ADD COLUMN     "orderNumbers" TEXT[],
ADD COLUMN     "partName" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "specification" TEXT;

-- AlterTable
ALTER TABLE "ProcessInspection" DROP COLUMN "batchId",
ADD COLUMN     "client" TEXT,
ADD COLUMN     "manager" TEXT,
ADD COLUMN     "orderNumbers" TEXT[],
ADD COLUMN     "partName" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "specification" TEXT;

-- AlterTable
ALTER TABLE "ShipmentInspection" DROP COLUMN "batchId",
ADD COLUMN     "client" TEXT,
ADD COLUMN     "manager" TEXT,
ADD COLUMN     "orderNumbers" TEXT[],
ADD COLUMN     "partName" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "specification" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "email",
DROP COLUMN "fullName",
DROP COLUMN "phoneNumber",
ADD COLUMN     "authType" TEXT DEFAULT 'local',
ADD COLUMN     "inspectionType" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "processLine" TEXT,
ADD COLUMN     "rank" TEXT;

-- DropTable
DROP TABLE "ExcelOrder";

-- DropTable
DROP TABLE "InspectionBatch";

-- DropTable
DROP TABLE "QualityHistory";

-- CreateTable
CREATE TABLE "Order" (
    "col0" INTEGER NOT NULL,
    "year" INTEGER,
    "month" INTEGER,
    "day" INTEGER,
    "category" TEXT,
    "finalorderNumber" TEXT,
    "orderNumber" TEXT,
    "code" TEXT,
    "registration" TEXT,
    "col2" TEXT,
    "customer" TEXT,
    "productName" TEXT,
    "partName" TEXT,
    "quantity" INTEGER,
    "specification" TEXT,
    "postProcess" TEXT,
    "production" INTEGER,
    "remaining" INTEGER,
    "status" TEXT,
    "sample" TEXT,
    "shippingDate" TEXT,
    "dDay" TEXT,
    "manager" TEXT,
    "shipping" TEXT,
    "jig" TEXT,
    "registration2" TEXT,
    "category2" TEXT,
    "unitPrice" INTEGER,
    "orderAmount" INTEGER,
    "etc" TEXT,
    "category3" TEXT,
    "salesManager" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("col0")
);
