import { apiClient } from './client';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ExportRequest, 
  ExportResponse,
  BulkActionRequest,
  BulkActionResponse 
} from '../types/api';
import { Order } from '../types/models';
import { TableQueryParams } from '../types/table-config';

// Order API 응답 타입 (백엔드 DTO 기반)
export interface OrderInfoResponseDto {
  col0: number;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  category?: string | null;
  code?: string | null;
  orderNumber?: string | null;
  finalorderNumber?: string | null;
  customer?: string | null;
  productName?: string | null;
  partName?: string | null;
  specification?: string | null;
  manager?: string | null;
  quantity?: number | null;
  production?: number | null;
  remaining?: number | null;
  status?: string | null;
  shippingDate?: string | null;
  dDay?: string | null;
  unitPrice?: number | null;
  orderAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// 검색 응답 타입 (백엔드 API 기반)
export interface OrderSearchResponse {
  orders: OrderInfoResponseDto[];
  missingOrderNumbers: string[];
  invalidOrderNumbers: string[];
  totalRequested: number;
  totalFound: number;
}

// Order API 클래스
export class OrderApi {
  private static instance: OrderApi;
  
  public static getInstance(): OrderApi {
    if (!OrderApi.instance) {
      OrderApi.instance = new OrderApi();
    }
    return OrderApi.instance;
  }

  /**
   * 발주번호로 주문 정보 검색 (기존 백엔드 API 활용)
   */
  async searchByOrderNumbers(orderNumbers: string[]): Promise<ApiResponse<OrderSearchResponse>> {
    try {
      const orderNumbersParam = orderNumbers.join(',');
      const response = await apiClient.get<ApiResponse<OrderSearchResponse>>(
        `/orders/search?orderNumbers=${encodeURIComponent(orderNumbersParam)}`
      );
      return response.data;
    } catch (error) {
      console.error('Order search failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 단일 발주번호로 주문 정보 조회 (기존 백엔드 API 활용)
   */
  async getByOrderNumber(orderNumber: string): Promise<ApiResponse<OrderInfoResponseDto | null>> {
    try {
      const response = await apiClient.get<ApiResponse<OrderInfoResponseDto | null>>(
        `/orders/single?orderNumber=${encodeURIComponent(orderNumber)}`
      );
      return response.data;
    } catch (error) {
      console.error('Single order fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 페이지네이션과 필터링을 지원하는 주문 목록 조회
   * 새로운 API 엔드포인트 (구현 필요)
   */
  async getOrders(params: TableQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const queryParams = new URLSearchParams();
      
      // 페이지네이션 파라미터
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      
      // 검색 파라미터
      if (params.search) queryParams.append('search', params.search);
      
      // 정렬 파라미터
      if (params.sort) queryParams.append('sort', params.sort);
      
      // 필터 파라미터
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            // 배열을 콤마로 구분된 문자열로 변환
            queryParams.append(key, value.join(','));
          } else if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      // 날짜 범위 파라미터
      if (params.dateRange) {
        if (params.dateRange.from) {
          const fromDate = params.dateRange.from instanceof Date 
            ? params.dateRange.from 
            : new Date(params.dateRange.from);
          if (!isNaN(fromDate.getTime())) {
            queryParams.append('dateFrom', fromDate.toISOString());
          }
        }
        if (params.dateRange.to) {
          const toDate = params.dateRange.to instanceof Date 
            ? params.dateRange.to 
            : new Date(params.dateRange.to);
          if (!isNaN(toDate.getTime())) {
            queryParams.append('dateTo', toDate.toISOString());
          }
        }
        if (params.dateRange.field) {
          queryParams.append('dateField', params.dateRange.field);
        }
      }

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
        `/orders?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Orders fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 주문 생성
   */
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 주문 업데이트
   */
  async updateOrder(id: number, orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Order update failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 주문 삭제
   */
  async deleteOrder(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Order deletion failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 벌크 액션 실행
   */
  async bulkAction(request: BulkActionRequest): Promise<ApiResponse<BulkActionResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<BulkActionResponse>>(
        '/orders/bulk-action',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Bulk action failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 데이터 내보내기
   */
  async exportOrders(request: ExportRequest): Promise<ApiResponse<ExportResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<ExportResponse>>(
        '/orders/export',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Export failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 주문 통계 조회
   */
  async getOrderStats(): Promise<ApiResponse<{
    totalOrders: number;
    ordersToday: number;
    ordersThisWeek: number;
    ordersThisMonth: number;
    statusDistribution: { status: string; count: number }[];
    recentOrders: OrderInfoResponseDto[];
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Order stats fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 주문 새로고침 (캐시 무효화)
   */
  async refreshOrders(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/orders/refresh');
      return response.data;
    } catch (error) {
      console.error('Orders refresh failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 필터 옵션 조회 (전체 데이터 기준)
   */
  async getFilterOptions(): Promise<ApiResponse<{
    status: string[];
    customer: string[];
    productName: string[];
    partName: string[];
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<{
        status: string[];
        customer: string[];
        productName: string[];
        partName: string[];
      }>>('/orders/filter-options');
      return response.data;
    } catch (error) {
      console.error('Filter options fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * API 에러 처리
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          return new Error(`잘못된 요청: ${message}`);
        case 401:
          return new Error('인증이 필요합니다. 다시 로그인해주세요.');
        case 403:
          return new Error('접근 권한이 없습니다.');
        case 404:
          return new Error('요청한 데이터를 찾을 수 없습니다.');
        case 422:
          return new Error(`데이터 검증 실패: ${message}`);
        case 429:
          return new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        case 500:
          return new Error('서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.');
        case 502:
          return new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
        case 503:
          return new Error('서비스를 일시적으로 사용할 수 없습니다.');
        default:
          return new Error(`서버 오류 (${status}): ${message}`);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      return new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    } else {
      // 요청 설정 중 오류가 발생한 경우
      return new Error(`요청 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const orderApi = OrderApi.getInstance();

// 편의 함수들
export const orderApiHelpers = {
  /**
   * Order 데이터를 OrderInfoResponseDto로 변환
   */
  mapOrderToDto(order: Order): OrderInfoResponseDto {
    return {
      col0: order.col0,
      orderNumber: order.orderNumber,
      finalorderNumber: order.finalorderNumber,
      customer: order.customer,
      productName: order.productName,
      partName: order.partName,
      specification: order.specification,
      manager: order.manager,
      quantity: order.quantity,
      production: order.production,
      remaining: order.remaining,
      status: order.status,
      shippingDate: order.shippingDate,
      dDay: order.dDay,
      unitPrice: order.unitPrice,
      orderAmount: order.orderAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  },

  /**
   * OrderInfoResponseDto를 Order로 변환
   */
  mapDtoToOrder(dto: OrderInfoResponseDto): Order {
    return {
      col0: dto.col0,
      year: undefined,
      month: undefined,
      day: undefined,
      category: undefined,
      finalorderNumber: dto.finalorderNumber || undefined,
      orderNumber: dto.orderNumber || undefined,
      code: undefined,
      registration: undefined,
      col2: undefined,
      customer: dto.customer || undefined,
      productName: dto.productName || undefined,
      partName: dto.partName || undefined,
      quantity: dto.quantity || undefined,
      specification: dto.specification || undefined,
      postProcess: undefined,
      production: dto.production || undefined,
      remaining: dto.remaining || undefined,
      status: dto.status || undefined,
      sample: undefined,
      shippingDate: dto.shippingDate || undefined,
      dDay: dto.dDay || undefined,
      manager: dto.manager || undefined,
      shipping: undefined,
      jig: undefined,
      registration2: undefined,
      category2: undefined,
      unitPrice: dto.unitPrice || undefined,
      orderAmount: dto.orderAmount || undefined,
      etc: undefined,
      category3: undefined,
      salesManager: undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  /**
   * 검색 쿼리 빌더
   */
  buildSearchQuery(params: {
    search?: string;
    status?: string[];
    customer?: string[];
    manager?: string[];
    dateRange?: {
      from?: Date;
      to?: Date;
      field?: 'orderDate' | 'shippingDate';
    };
  }): TableQueryParams {
    const queryParams: TableQueryParams = {};

    if (params.search) {
      queryParams.search = params.search;
    }

    if (params.status?.length || params.customer?.length || params.manager?.length) {
      queryParams.filters = {};
      
      if (params.status?.length) {
        queryParams.filters.status = params.status;
      }
      
      if (params.customer?.length) {
        queryParams.filters.customer = params.customer;
      }
      
      if (params.manager?.length) {
        queryParams.filters.manager = params.manager;
      }
    }

    // 날짜 범위 필터 구현
    if (params.dateRange?.from || params.dateRange?.to) {
      queryParams.dateRange = {
        from: params.dateRange.from,
        to: params.dateRange.to,
        field: params.dateRange.field || 'orderDate'
      };
    }

    return queryParams;
  },

  /**
   * 내보내기 요청 빌더
   */
  buildExportRequest(params: {
    format: 'csv' | 'excel' | 'json';
    filters?: Record<string, any>;
    selectedIds?: number[];
    fields?: string[];
    filename?: string;
  }): ExportRequest {
    return {
      table: 'order',
      format: params.format,
      filters: params.filters,
      ids: params.selectedIds,
      fields: params.fields,
      includeHeaders: true,
      filename: params.filename || `orders_${new Date().toISOString().split('T')[0]}.${params.format}`,
    };
  },
};