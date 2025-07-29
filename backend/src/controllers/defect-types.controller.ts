import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefectTypesService } from '../services/defect-types.service';
import { CreateDefectTypeDto } from '../dto/create-defect-type.dto';
import { UpdateDefectTypeDto } from '../dto/update-defect-type.dto';
import { ApiResponse as CommonApiResponse } from '../dto/common-response.dto';
import { DefectType } from '@prisma/client';

@ApiTags('불량 유형 관리')
@Controller('defect-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DefectTypesController {
  constructor(private readonly defectTypesService: DefectTypesService) {}

  @Get()
  @ApiOperation({
    summary: '불량 유형 목록 조회',
    description: '시스템에 등록된 모든 불량 유형 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '불량 유형 목록을 성공적으로 조회했습니다.',
  })
  async getDefectTypes(): Promise<CommonApiResponse<any[]>> {
    const defectTypes = await this.defectTypesService.getDefectTypes();
    return CommonApiResponse.success(
      defectTypes,
      '불량 유형 목록을 성공적으로 조회했습니다.',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '불량 유형 상세 조회',
    description: '특정 불량 유형의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '불량 유형 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '불량 유형을 성공적으로 조회했습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '불량 유형을 찾을 수 없습니다.',
  })
  async getDefectTypeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommonApiResponse<any>> {
    const defectType = await this.defectTypesService.getDefectTypeById(id);
    if (!defectType) {
      throw new HttpException(
        '불량 유형을 찾을 수 없습니다',
        HttpStatus.NOT_FOUND,
      );
    }
    return CommonApiResponse.success(
      defectType,
      '불량 유형을 성공적으로 조회했습니다.',
    );
  }

  @Post()
  @ApiOperation({
    summary: '새로운 불량 유형 생성',
    description: '새로운 불량 유형을 생성합니다. 관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '불량 유형이 성공적으로 생성되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '이미 존재하는 불량 유형입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '관리자 권한이 필요합니다.',
  })
  async createDefectType(
    @Body() createDefectTypeDto: CreateDefectTypeDto,
    @Request() req: any,
  ): Promise<CommonApiResponse<any>> {
    // Check if user is admin
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      throw new HttpException('관리자 권한이 필요합니다', HttpStatus.FORBIDDEN);
    }

    try {
      const defectType =
        await this.defectTypesService.createDefectType(createDefectTypeDto);
      return CommonApiResponse.success(
        defectType,
        '불량 유형이 성공적으로 생성되었습니다.',
      );
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new HttpException(
          '이미 존재하는 불량 유형입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: '불량 유형 수정',
    description:
      '기존 불량 유형의 정보를 수정합니다. 관리자 권한이 필요합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '불량 유형 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '불량 유형이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 불량 유형 ID이거나 이미 존재하는 불량 유형입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '불량 유형을 찾을 수 없습니다.',
  })
  async updateDefectType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDefectTypeDto: UpdateDefectTypeDto,
    @Request() req: any,
  ): Promise<CommonApiResponse<any>> {
    // Check if user is admin
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      throw new HttpException('관리자 권한이 필요합니다', HttpStatus.FORBIDDEN);
    }

    try {
      const updatedDefectType = await this.defectTypesService.updateDefectType(
        id,
        updateDefectTypeDto,
      );
      if (!updatedDefectType) {
        throw new HttpException(
          '불량 유형을 찾을 수 없습니다',
          HttpStatus.NOT_FOUND,
        );
      }
      return CommonApiResponse.success(
        updatedDefectType,
        '불량 유형이 성공적으로 수정되었습니다.',
      );
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new HttpException(
          '이미 존재하는 불량 유형입니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: '불량 유형 삭제',
    description: '특정 불량 유형을 삭제합니다. 관리자 권한이 필요합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '불량 유형 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '불량 유형이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 불량 유형 ID입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '불량 유형을 찾을 수 없습니다.',
  })
  async deleteDefectType(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<CommonApiResponse<null>> {
    // Check if user is admin
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      throw new HttpException('관리자 권한이 필요합니다', HttpStatus.FORBIDDEN);
    }

    const success = await this.defectTypesService.deleteDefectType(id);
    if (!success) {
      throw new HttpException(
        '불량 유형을 찾을 수 없습니다',
        HttpStatus.NOT_FOUND,
      );
    }

    return CommonApiResponse.success(
      null,
      '불량 유형이 성공적으로 삭제되었습니다.',
    );
  }
}
