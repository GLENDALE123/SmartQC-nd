import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ShipmentInspectionDefectDto {
  @IsOptional()
  @IsNumber()
  defectTypeId?: number;

  @IsOptional()
  @IsString()
  customType?: string;

  @IsNumber()
  count: number;

  @IsOptional()
  details?: any;
}

class ShipmentInspectionWorkerDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentInspectionDefectDto)
  defects: ShipmentInspectionDefectDto[];
}

class ShipmentInspectionRoundDto {
  @IsString()
  date: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  defectQty: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentInspectionWorkerDto)
  workers: ShipmentInspectionWorkerDto[];
}

class ShipmentInspectionAttachmentDto {
  @IsOptional()
  file?: Express.Multer.File;
}

export class CreateShipmentInspectionDto {
  @IsArray()
  @IsString({ each: true })
  orderNumbers: string[];

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  partName?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsString()
  inspectionDate: string;

  @IsNumber()
  totalQty: number;

  @IsNumber()
  defectQty: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  finalPeeling?: string;

  @IsOptional()
  @IsBoolean()
  externalCheck?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentInspectionRoundDto)
  rounds: ShipmentInspectionRoundDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentInspectionAttachmentDto)
  attachments?: ShipmentInspectionAttachmentDto[];
} 