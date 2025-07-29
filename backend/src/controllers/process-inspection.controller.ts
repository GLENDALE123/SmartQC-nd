import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcessInspectionService } from '../services/process-inspection.service';
import { CreateProcessInspectionDto } from '../dto/create-process-inspection.dto';
import { UpdateProcessInspectionDto } from '../dto/update-process-inspection.dto';
import { InspectionMultipartData } from '../decorators/multipart-data.decorator';
import { FileValidationService } from '../services/file-validation.service';

@ApiTags('공정검사')
@UseGuards(JwtAuthGuard)
@Controller('process-inspections')
export class ProcessInspectionController {
  constructor(
    private readonly service: ProcessInspectionService,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post()
  @InspectionMultipartData()
  @ApiOperation({ summary: '공정검사 생성' })
  @ApiResponse({
    status: 201,
    description: '공정검사가 성공적으로 생성되었습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
  async create(@Body() dto: CreateProcessInspectionDto) {
    // 파일 검증 (파일이 있는 경우)
    if (dto.attachments && dto.attachments.length > 0) {
      const files = dto.attachments
        .map((attachment) => attachment.file)
        .filter(Boolean);
      if (files.length > 0) {
        const validationResult = this.fileValidationService.validateFiles(
          files,
          this.fileValidationService.getInspectionAttachmentOptions(),
        );

        if (!validationResult.isValid) {
          throw new HttpException(
            {
              message: '파일 검증 실패',
              errors: validationResult.errors,
              warnings: validationResult.warnings,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // 경고가 있는 경우 로그 출력
        if (validationResult.warnings.length > 0) {
          // 파일 검증 경고가 있을 경우 별도 처리
        }
      }
    }

    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProcessInspectionDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
