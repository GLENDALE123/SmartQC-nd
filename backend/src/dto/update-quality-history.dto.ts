import { PartialType } from '@nestjs/mapped-types';
import { CreateQualityHistoryDto } from './create-quality-history.dto';

export class UpdateQualityHistoryDto extends PartialType(
  CreateQualityHistoryDto,
) {}
