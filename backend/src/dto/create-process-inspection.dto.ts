import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProcessInspectionDefectDto {
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

class ProcessInspectionAttachmentDto {
  @IsOptional()
  file?: Express.Multer.File;
}

class ProcessInspectionRoundDto {
  @IsString()
  label: string;

  @IsNumber()
  qty: number;
}

export class CreateProcessInspectionDto {
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
  paintPrimer?: string;

  @IsOptional()
  @IsString()
  paintTopcoat?: string;

  // 추가 필드
  @IsOptional()
  @IsString()
  line?: string;

  @IsOptional()
  @IsString()
  subLine?: string;

  @IsOptional()
  @IsString()
  peelingTest?: string;

  @IsOptional()
  @IsString()
  colorDiff?: string;

  @IsOptional()
  @IsString()
  extraWork?: string;

  @IsOptional()
  @IsString()
  lineSpeed?: string;

  @IsOptional()
  @IsString()
  spindleRatio?: string;

  @IsOptional()
  @IsString()
  uvCond?: string;

  @IsOptional()
  @IsString()
  irCond?: string;

  @IsOptional()
  @IsString()
  jig?: string;

  @IsOptional()
  @IsString()
  injectionPack?: string;

  @IsOptional()
  @IsString()
  afterPack?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessInspectionRoundDto)
  rounds: ProcessInspectionRoundDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessInspectionDefectDto)
  defects: ProcessInspectionDefectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessInspectionAttachmentDto)
  attachments?: ProcessInspectionAttachmentDto[];
}
