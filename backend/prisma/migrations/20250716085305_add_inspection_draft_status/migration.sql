-- CreateEnum
CREATE TYPE "InspectionDraftStatus" AS ENUM ('draft', 'completed');

-- AlterTable
ALTER TABLE "IncomingInspection" ADD COLUMN     "status" "InspectionDraftStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "ProcessInspection" ADD COLUMN     "status" "InspectionDraftStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "ShipmentInspection" ADD COLUMN     "status" "InspectionDraftStatus" NOT NULL DEFAULT 'draft';
