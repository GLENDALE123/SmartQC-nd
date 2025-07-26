import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { QualityHistoryController } from './controllers/quality-history.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
// import { QualityHistoryService } from './services/quality-history.service';
import { PrismaService } from './prisma.service';
// import { UploadController } from './controllers/upload.controller';
// import { UploadLogService } from './services/upload-log.service';
// import { UploadLogController } from './controllers/upload-log.controller';

import { forwardRef } from '@nestjs/common';
import { DefectTypesController } from './controllers/defect-types.controller';
import { DefectTypesService } from './services/defect-types.service';
import { ColorValidationService } from './services/color-validation.service';
import { IncomingInspectionController } from './controllers/incoming-inspection.controller';
import { IncomingInspectionService } from './services/incoming-inspection.service';
import { ProcessInspectionController } from './controllers/process-inspection.controller';
import { ProcessInspectionService } from './services/process-inspection.service';
import { ShipmentInspectionController } from './controllers/shipment-inspection.controller';
import { ShipmentInspectionService } from './services/shipment-inspection.service';
// import { InspectionBatchController } from './controllers/inspection-batch.controller';
import { InspectionController } from './controllers/inspection.controller';
import { ImageUploadController } from './controllers/image-upload.controller';
import { SharedFolderService } from './services/shared-folder.service';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { UnifiedInspectionService } from './services/unified-inspection.service';
import { FileValidationService } from './services/file-validation.service';
import { UploadsController } from './controllers/uploads.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    IncomingInspectionController,
    ProcessInspectionController,
    ShipmentInspectionController,
    // QualityHistoryController,
    // UploadController,
    // UploadLogController,
    DefectTypesController,
    AuthController,
    // InspectionBatchController,
    InspectionController,
    ImageUploadController,
    OrderController,
  ],
  providers: [
    IncomingInspectionService,
    ProcessInspectionService,
    ShipmentInspectionService,
    // QualityHistoryService,
    PrismaService,
    // UploadLogService,
    // ExcelOrderService,
    DefectTypesService,
    ColorValidationService,
    AuthService,
    SharedFolderService,
    OrderService,
    UnifiedInspectionService,
    FileValidationService,
  ],
})
export class QualityControlModule {}
