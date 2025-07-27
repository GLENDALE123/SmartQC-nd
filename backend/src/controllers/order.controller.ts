import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OrderService } from '../services/order.service';
import { OrderInfoResponseDto } from '../dto/order-info-response.dto';
import { ApiResponse as CommonApiResponse } from '../dto/common-response.dto';
import { ValidationException } from '../exceptions/custom-exceptions';

@ApiTags('주문 정보')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '주문 목록 조회 (페이지네이션, 검색, 정렬 지원)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (1부터 시작)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '검색어' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: '정렬 조건 (예: col0.desc)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: '시작 날짜 (ISO 문자열)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: '종료 날짜 (ISO 문자열)' })
  @ApiQuery({ name: 'dateField', required: false, type: String, description: '날짜 필드명 (기본값: createdAt)' })
  async getOrders(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('dateField') dateField?: string,
  ): Promise<{
    data: OrderInfoResponseDto[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    // 날짜 범위 객체 구성
    let dateRange: { from?: Date; to?: Date; field?: string } | undefined;
    
    if (dateFrom || dateTo) {
      dateRange = {
        field: dateField || 'createdAt'
      };
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          dateRange.from = fromDate;
        }
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          dateRange.to = toDate;
        }
      }
    }

    return this.orderService.getOrdersWithPagination({
      page,
      pageSize,
      search,
      sort,
      dateRange,
    });
  }

  @Get('search')
  @ApiOperation({ 
    summary: '발주번호로 주문 정보 검색', 
    description: '발주번호 배열을 받아 해당하는 주문 정보들을 조회합니다. 발주번호 형식 검증을 포함합니다.' 
  })
  @ApiQuery({ 
    name: 'orderNumbers', 
    required: true, 
    type: String,
    description: '콤마로 구분된 발주번호 목록 (예: T00000-1,T00000-2). 영문자로 시작하고 숫자와 하이픈을 포함하는 형식',
    example: 'T00000-1,T00000-2'
  })
  @ApiResponse({ 
    status: 200, 
    description: '주문 정보 조회 성공',
    type: [OrderInfoResponseDto]
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 파라미터 또는 발주번호 형식 오류' 
  })
  async searchOrders(
    @Query('orderNumbers') orderNumbersParam: string
  ): Promise<CommonApiResponse<{
    orders: OrderInfoResponseDto[];
    missingOrderNumbers: string[];
    invalidOrderNumbers: string[];
    totalRequested: number;
    totalFound: number;
  }>> {
    if (!orderNumbersParam || typeof orderNumbersParam !== 'string') {
      throw new ValidationException('orderNumbers 파라미터가 필요합니다.');
    }

    // 콤마로 구분된 발주번호들을 배열로 변환
    const rawOrderNumbers = orderNumbersParam
      .split(',')
      .map(orderNumber => orderNumber.trim())
      .filter(orderNumber => orderNumber.length > 0);

    if (rawOrderNumbers.length === 0) {
      throw new ValidationException('유효한 발주번호가 없습니다.');
    }

    // 최대 50개까지만 허용 (성능 고려)
    if (rawOrderNumbers.length > 50) {
      throw new ValidationException('한 번에 최대 50개의 발주번호만 조회할 수 있습니다.');
    }

    // 병렬 처리로 성능 최적화 - 새로운 최적화된 메서드 사용
    const [orders, existenceCheck] = await Promise.all([
      this.orderService.searchByOrderNumbers(rawOrderNumbers),
      this.orderService.checkOrderNumbersExistence(rawOrderNumbers)
    ]);

    const { missing: missingOrderNumbers, invalid: invalidOrderNumbers } = existenceCheck;

    let message = `${orders.length}개의 주문 정보를 조회했습니다.`;
    if (missingOrderNumbers.length > 0) {
      message += ` ${missingOrderNumbers.length}개의 발주번호를 찾을 수 없습니다.`;
    }
    if (invalidOrderNumbers.length > 0) {
      message += ` ${invalidOrderNumbers.length}개의 발주번호 형식이 올바르지 않습니다.`;
    }

    return CommonApiResponse.success({
      orders,
      missingOrderNumbers,
      invalidOrderNumbers,
      totalRequested: rawOrderNumbers.length,
      totalFound: orders.length
    }, message);
  }

  @Get('single')
  @ApiOperation({ 
    summary: '단일 발주번호로 주문 정보 조회', 
    description: '하나의 발주번호로 주문 정보를 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'orderNumber', 
    required: true, 
    type: String,
    description: '발주번호',
    example: 'T00000-1'
  })
  @ApiResponse({ 
    status: 200, 
    description: '주문 정보 조회 성공',
    type: OrderInfoResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: '주문 정보를 찾을 수 없음' 
  })
  async getOrderByNumber(
    @Query('orderNumber') orderNumber: string
  ): Promise<CommonApiResponse<OrderInfoResponseDto | null>> {
    if (!orderNumber || typeof orderNumber !== 'string') {
      throw new ValidationException('orderNumber 파라미터가 필요합니다.');
    }

    const order = await this.orderService.findByOrderNumber(orderNumber.trim());
    
    if (!order) {
      return CommonApiResponse.success(null, '해당 발주번호의 주문 정보를 찾을 수 없습니다.');
    }

    return CommonApiResponse.success(order, '주문 정보를 조회했습니다.');
  }
}