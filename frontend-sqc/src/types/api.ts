// API 응답 타입 정의

import { TableKey, TableDataMap } from './models';
import { TableQueryParams, TableMetadata } from './table-config';

// 기본 API 응답 인터페이스
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
  requestId?: string;
}

// 에러 응답 인터페이스
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    timestamp: string;
  };
  success: false;
}

// 페이지네이션 응답 인터페이스
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata?: TableMetadata;
}

// 테이블 데이터 API 응답
export type TableApiResponse<T extends TableKey> = ApiResponse<PaginatedResponse<TableDataMap[T]>>;

// 테이블 스키마 API 응답
export interface TableSchemaResponse {
  table: string;
  fields: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'array';
    nullable: boolean;
    unique?: boolean;
    enum?: string[];
    defaultValue?: any;
    description?: string;
  }[];
  relations: {
    name: string;
    type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
    relatedTable: string;
    foreignKey?: string;
  }[];
  indexes: {
    name: string;
    fields: string[];
    unique: boolean;
  }[];
}

// 벌크 액션 요청
export interface BulkActionRequest {
  action: string;
  ids: (string | number)[];
  params?: Record<string, any>;
}

// 벌크 액션 응답
export interface BulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  results: {
    id: string | number;
    success: boolean;
    error?: string;
  }[];
  message?: string;
}

// 데이터 내보내기 요청
export interface ExportRequest {
  table: TableKey;
  format: 'csv' | 'excel' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
  ids?: (string | number)[]; // 선택된 행만 내보내기
  includeHeaders?: boolean;
  filename?: string;
}

// 데이터 내보내기 응답
export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  size: number;
  expiresAt: string;
  format: string;
}

// 데이터 가져오기 요청
export interface ImportRequest {
  table: TableKey;
  file: File;
  options?: {
    skipFirstRow?: boolean;
    delimiter?: string;
    encoding?: string;
    mapping?: Record<string, string>; // CSV 컬럼 -> DB 필드 매핑
    validation?: {
      strict?: boolean;
      skipInvalid?: boolean;
    };
  };
}

// 데이터 가져오기 응답
export interface ImportResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: {
    total: number;
    processed: number;
    success: number;
    failed: number;
  };
  results?: {
    success: number;
    failed: number;
    errors: {
      row: number;
      field?: string;
      message: string;
    }[];
  };
  downloadUrl?: string; // 에러 리포트 다운로드 URL
}

// 실시간 업데이트 이벤트
export interface RealtimeEvent<T extends TableKey = TableKey> {
  type: 'insert' | 'update' | 'delete';
  table: T;
  data: TableDataMap[T] | TableDataMap[T][];
  timestamp: string;
  userId?: string;
}

// 테이블 통계 응답
export interface TableStatsResponse {
  table: TableKey;
  totalRecords: number;
  recordsToday: number;
  recordsThisWeek: number;
  recordsThisMonth: number;
  lastUpdated: string;
  topValues?: {
    field: string;
    values: {
      value: string;
      count: number;
      percentage: number;
    }[];
  }[];
}

// API 클라이언트 설정
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
  interceptors?: {
    request?: (config: any) => any;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

// API 엔드포인트 정의
export interface ApiEndpoints {
  // 테이블 데이터 CRUD
  getTables: () => string;
  getTableData: (table: TableKey, params?: TableQueryParams) => string;
  getTableSchema: (table: TableKey) => string;
  getTableStats: (table: TableKey) => string;
  createRecord: (table: TableKey) => string;
  updateRecord: (table: TableKey, id: string | number) => string;
  deleteRecord: (table: TableKey, id: string | number) => string;
  
  // 벌크 액션
  bulkAction: (table: TableKey) => string;
  
  // 데이터 내보내기/가져오기
  exportData: (table: TableKey) => string;
  importData: (table: TableKey) => string;
  getImportStatus: (jobId: string) => string;
  
  // 뷰 관리
  getViews: (table: TableKey) => string;
  createView: (table: TableKey) => string;
  updateView: (table: TableKey, viewId: string) => string;
  deleteView: (table: TableKey, viewId: string) => string;
  
  // 실시간 업데이트
  websocket: () => string;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API 요청 옵션
export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  signal?: AbortSignal;
}

// API 응답 인터셉터 타입
export type ResponseInterceptor<T = any> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

// API 에러 인터셉터 타입
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError> | never;

// 캐시 설정
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
}

// API 훅 옵션
export interface ApiHookOptions<T = any> {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: T | undefined, error: ApiError | null) => void;
}

// 뮤테이션 옵션
export interface MutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => Promise<any> | any;
}

// WebSocket 메시지 타입
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

// WebSocket 연결 상태
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket 설정
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeat?: {
    interval: number;
    message: string;
  };
}