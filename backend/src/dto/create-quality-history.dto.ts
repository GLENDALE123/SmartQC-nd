import { IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateQualityHistoryDto {
  @IsArray()
  @ArrayNotEmpty()
  excelOrderIds: number[];
}
