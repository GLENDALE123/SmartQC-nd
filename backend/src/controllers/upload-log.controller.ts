import { Controller, Get, Query, Param } from '@nestjs/common';
import { UploadLogService } from '../services/upload-log.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('업로드 이력')
@Controller('upload/logs')
export class UploadLogController {
  constructor(private readonly uploadLogService: UploadLogService) {}

  @Get(':id')
  @ApiOperation({ summary: '업로드 이력 상세 조회' })
  @ApiResponse({ status: 200, description: '업로드 이력 상세' })
  async getLogDetail(@Param('id') id: string) {
    return this.uploadLogService.getLogDetail(Number(id));
  }

  @Get()
  @ApiOperation({ summary: '업로드 이력 리스트 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '가져올 개수(기본 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '시작 위치(기본 0)' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: '업로더 ID' })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: '파일명 검색' })
  @ApiQuery({ name: 'from', required: false, type: String, description: '시작일(YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: '종료일(YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '업로드 이력 리스트' })
  async getLogs(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
    @Query('userId') userId?: string,
    @Query('keyword') keyword?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.uploadLogService.getLogs({
      limit: Number(limit),
      offset: Number(offset),
      userId: userId ? Number(userId) : undefined,
      keyword,
      from,
      to,
    });
  }
} 
 