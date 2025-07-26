import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInspectionBatchDto {
  @IsNumber()
  @IsNotEmpty()
  qualityHistoryId: number;

  @IsString()
  @IsOptional()
  name?: string;
} 