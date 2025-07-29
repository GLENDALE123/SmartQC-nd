import { PartialType } from '@nestjs/mapped-types';
import { CreateShipmentInspectionDto } from './create-shipment-inspection.dto';

export class UpdateShipmentInspectionDto extends PartialType(
  CreateShipmentInspectionDto,
) {}
