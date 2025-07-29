import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessInspectionDto } from './create-process-inspection.dto';

export class UpdateProcessInspectionDto extends PartialType(
  CreateProcessInspectionDto,
) {}
