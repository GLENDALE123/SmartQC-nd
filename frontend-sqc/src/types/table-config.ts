// 테이블 설정 관련 타입 정의

import { TableKey, TableDataMap } from './models';

// 테이블 설정 타입
// 컬럼 설정 인터페이스
export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'enum' | 'currency' | 'badge' | 'array';
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  visible?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: string; // 날짜 포맷, 통화 포맷 등
  enumOptions?: { value: string; label: string; color?: string }[];
  cellRenderer?: string; // 커스텀 셀 렌더러 이름
}

// 필터 설정 인터페이스
export interface FilterConfig {
  type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange';
  options?: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  defaultValue?: any;
}

// 테이블 설정 인터페이스
export interface TableConfig<T extends TableKey = TableKey> {
  key: T;
  name: string;
  description?: string;
  icon?: string;
  endpoint: string;
  columns: ColumnConfig[];
  searchableFields: string[];
  filterableFields: string[];
  dateFields: string[];
  sortableFields: string[];
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  features?: {
    search?: boolean;
    filter?: boolean;
    sort?: boolean;
    export?: boolean;
    bulkActions?: boolean;
    columnVisibility?: boolean;
    refresh?: boolean;
  };
  filters?: Record<string, FilterConfig>;
  bulkActions?: BulkActionConfig[];
  rowActions?: RowActionConfig[];
}

// 벌크 액션 설정
export interface BulkActionConfig {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  permissions?: string[];
}

// 행 액션 설정
export interface RowActionConfig {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  permissions?: string[];
  condition?: (row: any) => boolean; // 조건부 표시
}

// 테이블 뷰 설정 (사용자 정의 뷰)
export interface TableViewConfig {
  id: string;
  name: string;
  tableKey: TableKey;
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: Date;
  settings: {
    columns: {
      [key: string]: {
        visible: boolean;
        width?: number;
        order: number;
      };
    };
    filters: Record<string, any>;
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    }[];
    pagination: {
      pageSize: number;
    };
  };
}

// 다중 테이블 설정
export interface MultiTableConfig {
  tables: Record<TableKey, TableConfig>;
  defaultTable: TableKey;
  layout: {
    sidebarWidth: number;
    showTableSelector: boolean;
    showViewManager: boolean;
  };
  features: {
    tableSwitch: boolean;
    viewManagement: boolean;
    globalSearch: boolean;
    crossTableActions: boolean;
  };
}

// 테이블 상태 인터페이스
export interface TableState<T extends TableKey = TableKey> {
  currentTable: T;
  data: TableDataMap[T][];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  filters: Record<string, any>;
  search: string;
  selectedRows: string[] | number[];
  columnVisibility: Record<string, boolean>;
  currentView?: TableViewConfig;
}

// 테이블 액션 타입
export type TableAction<T extends TableKey = TableKey> = 
  | { type: 'SET_TABLE'; payload: T }
  | { type: 'SET_DATA'; payload: TableDataMap[T][] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGINATION'; payload: Partial<TableState['pagination']> }
  | { type: 'SET_SORTING'; payload: TableState['sorting'] }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SELECTED_ROWS'; payload: string[] | number[] }
  | { type: 'SET_COLUMN_VISIBILITY'; payload: Record<string, boolean> }
  | { type: 'SET_CURRENT_VIEW'; payload: TableViewConfig | undefined }
  | { type: 'RESET_STATE' };

// 테이블 컨텍스트 인터페이스
export interface TableContextValue<T extends TableKey = TableKey> {
  state: TableState<T>;
  dispatch: React.Dispatch<TableAction<T>>;
  config: TableConfig<T>;
  actions: {
    switchTable: (tableKey: T) => void;
    loadData: () => Promise<void>;
    refreshData: () => Promise<void>;
    updateFilters: (filters: Record<string, any>) => void;
    updateSearch: (search: string) => void;
    updateSorting: (sorting: TableState['sorting']) => void;
    updatePagination: (pagination: Partial<TableState['pagination']>) => void;
    selectRows: (rows: string[] | number[]) => void;
    toggleColumnVisibility: (columnKey: string) => void;
    saveView: (view: Omit<TableViewConfig, 'id' | 'createdAt'>) => Promise<void>;
    loadView: (viewId: string) => Promise<void>;
    deleteView: (viewId: string) => Promise<void>;
    exportData: (format: 'csv' | 'excel', selectedOnly?: boolean) => Promise<void>;
    executeBulkAction: (actionKey: string, selectedRows: string[] | number[]) => Promise<void>;
    executeRowAction: (actionKey: string, row: TableDataMap[T]) => Promise<void>;
  };
}

// 테이블 훅 옵션
export interface UseTableOptions<T extends TableKey = TableKey> {
  tableKey: T;
  initialView?: string;
  autoLoad?: boolean;
  enableRealtime?: boolean;
  cacheKey?: string;
  onError?: (error: Error) => void;
  onDataChange?: (data: TableDataMap[T][]) => void;
}

// 테이블 쿼리 파라미터
export interface TableQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
  fields?: string[];
  dateRange?: {
    from?: Date | string;
    to?: Date | string;
    field?: string;
  };
}

// 테이블 메타데이터
export interface TableMetadata {
  totalCount: number;
  filteredCount: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  lastUpdated: Date;
  schema: {
    fields: {
      name: string;
      type: string;
      nullable: boolean;
      unique?: boolean;
      enum?: string[];
    }[];
  };
}