import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IncomingInspectionDefectDto {
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

class IncomingInspectionAttachmentDto {
  @IsOptional()
  file?: Express.Multer.File;
}

export class CreateIncomingInspectionDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncomingInspectionDefectDto)
  defects: IncomingInspectionDefectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncomingInspectionAttachmentDto)
  attachments?: IncomingInspectionAttachmentDto[];
} 