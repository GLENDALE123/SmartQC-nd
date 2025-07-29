import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomingInspectionDto } from './create-incoming-inspection.dto';

export class UpdateIncomingInspectionDto extends PartialType(
  CreateIncomingInspectionDto,
) {}
