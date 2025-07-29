import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T = any> {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ description: '메시지', required: false })
  message?: string;

  @ApiProperty({ description: '타임스탬프' })
  timestamp: string;

  constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(message: string): ApiResponse {
    return new ApiResponse(false, undefined, message);
  }
}

export class PaginatedResponse<T> extends ApiResponse<T[]> {
  @ApiProperty({ description: '총 개수' })
  total: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '총 페이지 수' })
  totalPages: number;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ) {
    super(true, data, message);
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

export class ErrorResponse extends ApiResponse {
  @ApiProperty({ description: '에러 코드', required: false })
  errorCode?: string;

  @ApiProperty({ description: '에러 상세 정보', required: false })
  details?: any;

  constructor(message: string, errorCode?: string, details?: any) {
    super(false, undefined, message);
    this.errorCode = errorCode;
    this.details = details;
  }
}
