-- AlterTable
ALTER TABLE "QualityHistory" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "hasDefects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderId" INTEGER;
