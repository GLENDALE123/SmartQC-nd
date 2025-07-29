import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IncomingInspectionService } from '../services/incoming-inspection.service';
import { ProcessInspectionService } from '../services/process-inspection.service';
import { ShipmentInspectionService } from '../services/shipment-inspection.service';
import { UnifiedInspectionService } from '../services/unified-inspection.service';
import { RecentInspectionsQueryDto } from '../dto/recent-inspections-query.dto';
import { UnifiedInspectionResponseDto } from '../dto/unified-inspection-response.dto';
import {
  ApiResponse as CommonApiResponse,
  PaginatedResponse,
} from '../dto/common-response.dto';

@ApiTags('검사')
@Controller('inspections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InspectionController {
  constructor(
    private readonly incomingInspectionService: IncomingInspectionService,
    private readonly processInspectionService: ProcessInspectionService,
    private readonly shipmentInspectionService: ShipmentInspectionService,
    private readonly unifiedInspectionService: UnifiedInspectionService,
  ) {}

  @Get('recent')
  @ApiOperation({
    summary: '최근 검사 이력 조회',
    description:
      'orderNumber, productName, partName, type, limit 필터링을 지원하는 최근 검사 이력을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '최근 검사 이력 조회 성공',
    type: PaginatedResponse<UnifiedInspectionResponseDto>,
  })
  async getRecentInspections(@Query() query: RecentInspectionsQueryDto) {
    const result =
      await this.unifiedInspectionService.getRecentInspections(query);
    return new PaginatedResponse(
      result.data,
      result.total,
      result.page,
      result.limit,
      '최근 검사 이력 조회 성공',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '검사 상세 조회',
    description: '검사 ID와 type 파라미터로 검사 상세 정보를 조회합니다.',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['incoming', 'process', 'shipment'],
  })
  @ApiResponse({
    status: 200,
    description: '검사 상세 조회 성공',
    type: CommonApiResponse<UnifiedInspectionResponseDto>,
  })
  async getInspectionById(
    @Param('id') id: string,
    @Query('type') type: 'incoming' | 'process' | 'shipment',
  ) {
    if (!['incoming', 'process', 'shipment'].includes(type)) {
      throw new HttpException(
        '지원하지 않는 검사 유형입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const inspection = await this.unifiedInspectionService.getInspectionById(
      +id,
      type,
    );
    if (!inspection) {
      throw new NotFoundException('검사 내역을 찾을 수 없습니다.');
    }

    return CommonApiResponse.success(inspection, '검사 상세 조회 성공');
  }

  @Get('references')
  @ApiOperation({
    summary: '검사 참고 이력 조회',
    description:
      'orderNumbers 기반으로 관련 검사 이력을 조회합니다. 주문번호, 제품명, 부속명, 검사유형으로 필터링 가능합니다.',
  })
  @ApiQuery({
    name: 'orderNumbers',
    required: false,
    type: String,
    description: '발주번호 배열 (쉼표로 구분)',
  })
  @ApiQuery({
    name: 'orderNumber',
    required: false,
    type: String,
    description: '단일 발주번호',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    type: String,
    description: '제품명',
  })
  @ApiQuery({
    name: 'partName',
    required: false,
    type: String,
    description: '부속명',
  })
  @ApiQuery({
    name: 'client',
    required: false,
    type: String,
    description: '발주처',
  })
  @ApiQuery({
    name: 'inspectionType',
    required: true,
    type: String,
    enum: ['incoming', 'process', 'shipment'],
  })
  @ApiResponse({ status: 200, description: '참고 이력 조회 성공' })
  async getReferences(
    @Query('orderNumbers') orderNumbers?: string,
    @Query('orderNumber') orderNumber?: string,
    @Query('productName') productName?: string,
    @Query('partName') partName?: string,
    @Query('client') client?: string,
    @Query('inspectionType') inspectionType?: string,
  ) {
    if (
      !inspectionType ||
      !['incoming', 'process', 'shipment'].includes(inspectionType)
    ) {
      throw new HttpException(
        '지원하지 않는 검사 유형입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // orderNumbers 문자열을 배열로 변환
    const orderNumbersArray = orderNumbers
      ? orderNumbers.split(',').map((s) => s.trim())
      : undefined;

    const params = {
      orderNumbers: orderNumbersArray,
      orderNumber,
      productName,
      partName,
      client,
    };

    let result;
    if (inspectionType === 'incoming') {
      result = await this.incomingInspectionService.getReferences(params);
    } else if (inspectionType === 'process') {
      result = await this.processInspectionService.getReferences(params);
    } else if (inspectionType === 'shipment') {
      result = await this.shipmentInspectionService.getReferences(params);
    }

    return CommonApiResponse.success(result, '참고 이력 조회 성공');
  }
}
