-- CreateTable
CREATE TABLE "UploadLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "fileName" TEXT NOT NULL,
    "successCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcelOrder" (
    "id" SERIAL NOT NULL,
    "col0" TEXT,
    "year" INTEGER,
    "month" INTEGER,
    "day" INTEGER,
    "category" TEXT,
    "col1" TEXT,
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

    CONSTRAINT "ExcelOrder_pkey" PRIMARY KEY ("id")
);
