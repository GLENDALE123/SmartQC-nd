// 다중 테이블 상태 관리 타입 정의

import { TableKey, TableDataMap } from './models';
import { TableConfig, TableViewConfig, TableState } from './table-config';

// 다중 테이블 전역 상태
export interface MultiTableState {
  // 현재 활성 테이블
  activeTable: TableKey;
  
  // 각 테이블별 상태
  tables: {
    [K in TableKey]: TableState<K>;
  };
  
  // 테이블 설정
  configs: {
    [K in TableKey]: TableConfig<K>;
  };
  
  // 사용자 정의 뷰
  views: {
    [K in TableKey]: TableViewConfig[];
  };
  
  // 전역 설정
  globalSettings: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    density: 'compact' | 'normal' | 'comfortable';
    autoRefresh: boolean;
    autoRefreshInterval: number;
    defaultPageSize: number;
    showRowNumbers: boolean;
    enableKeyboardShortcuts: boolean;
  };
  
  // UI 상태
  ui: {
    loading: boolean;
    error: string | null;
    notifications: Notification[];
    modals: {
      viewManager: boolean;
      exportDialog: boolean;
      importDialog: boolean;
      confirmDialog: {
        open: boolean;
        title: string;
        message: string;
        onConfirm?: () => void;
        onCancel?: () => void;
      };
    };
  };
  
  // 실시간 연결 상태
  realtime: {
    connected: boolean;
    lastHeartbeat?: Date;
    subscriptions: TableKey[];
  };
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
  timestamp: Date;
}

// 다중 테이블 액션 타입
export type MultiTableAction = 
  // 테이블 전환
  | { type: 'SWITCH_TABLE'; payload: TableKey }
  
  // 테이블 상태 업데이트
  | { type: 'UPDATE_TABLE_STATE'; payload: { table: TableKey; state: Partial<TableState> } }
  
  // 설정 업데이트
  | { type: 'UPDATE_CONFIG'; payload: { table: TableKey; config: Partial<TableConfig> } }
  | { type: 'UPDATE_GLOBAL_SETTINGS'; payload: Partial<MultiTableState['globalSettings']> }
  
  // 뷰 관리
  | { type: 'ADD_VIEW'; payload: { table: TableKey; view: TableViewConfig } }
  | { type: 'UPDATE_VIEW'; payload: { table: TableKey; viewId: string; view: Partial<TableViewConfig> } }
  | { type: 'DELETE_VIEW'; payload: { table: TableKey; viewId: string } }
  | { type: 'SET_VIEWS'; payload: { table: TableKey; views: TableViewConfig[] } }
  
  // UI 상태
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'TOGGLE_MODAL'; payload: { modal: keyof MultiTableState['ui']['modals']; open?: boolean } }
  | { type: 'SET_CONFIRM_DIALOG'; payload: MultiTableState['ui']['modals']['confirmDialog'] }
  
  // 실시간 상태
  | { type: 'SET_REALTIME_STATUS'; payload: { connected: boolean; lastHeartbeat?: Date } }
  | { type: 'ADD_REALTIME_SUBSCRIPTION'; payload: TableKey }
  | { type: 'REMOVE_REALTIME_SUBSCRIPTION'; payload: TableKey }
  
  // 초기화
  | { type: 'RESET_STATE' }
  | { type: 'RESET_TABLE_STATE'; payload: TableKey };

// 다중 테이블 컨텍스트 값
export interface MultiTableContextValue {
  state: MultiTableState;
  dispatch: React.Dispatch<MultiTableAction>;
  
  // 테이블 관리 액션
  actions: {
    // 테이블 전환
    switchTable: (table: TableKey) => void;
    
    // 데이터 로딩
    loadTableData: <T extends TableKey>(table: T) => Promise<void>;
    refreshTableData: <T extends TableKey>(table: T) => Promise<void>;
    
    // 필터링 및 검색
    updateTableFilters: <T extends TableKey>(table: T, filters: Record<string, any>) => void;
    updateTableSearch: <T extends TableKey>(table: T, search: string) => void;
    updateTableSorting: <T extends TableKey>(table: T, sorting: TableState['sorting']) => void;
    updateTablePagination: <T extends TableKey>(table: T, pagination: Partial<TableState['pagination']>) => void;
    
    // 행 선택
    selectTableRows: <T extends TableKey>(table: T, rows: string[] | number[]) => void;
    toggleTableColumnVisibility: <T extends TableKey>(table: T, columnKey: string) => void;
    
    // 뷰 관리
    saveTableView: <T extends TableKey>(table: T, view: Omit<TableViewConfig, 'id' | 'createdAt'>) => Promise<void>;
    loadTableView: <T extends TableKey>(table: T, viewId: string) => Promise<void>;
    deleteTableView: <T extends TableKey>(table: T, viewId: string) => Promise<void>;
    
    // 데이터 내보내기/가져오기
    exportTableData: <T extends TableKey>(table: T, format: 'csv' | 'excel', selectedOnly?: boolean) => Promise<void>;
    importTableData: <T extends TableKey>(table: T, file: File) => Promise<void>;
    
    // 벌크 액션
    executeBulkAction: <T extends TableKey>(table: T, actionKey: string, selectedRows: string[] | number[]) => Promise<void>;
    executeRowAction: <T extends TableKey>(table: T, actionKey: string, row: TableDataMap[T]) => Promise<void>;
    
    // 알림 관리
    showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    hideNotification: (id: string) => void;
    clearNotifications: () => void;
    
    // 모달 관리
    openModal: (modal: keyof MultiTableState['ui']['modals']) => void;
    closeModal: (modal: keyof MultiTableState['ui']['modals']) => void;
    showConfirmDialog: (options: {
      title: string;
      message: string;
      onConfirm?: () => void;
      onCancel?: () => void;
    }) => void;
    
    // 설정 관리
    updateGlobalSettings: (settings: Partial<MultiTableState['globalSettings']>) => void;
    
    // 실시간 업데이트
    subscribeToTable: (table: TableKey) => void;
    unsubscribeFromTable: (table: TableKey) => void;
  };
}

// 테이블 선택기 프롭스
export interface TableSelectorProps {
  currentTable: TableKey;
  onTableChange: (table: TableKey) => void;
  tables: {
    key: TableKey;
    name: string;
    icon?: string;
    badge?: string | number;
    disabled?: boolean;
  }[];
  views?: TableViewConfig[];
  onViewSelect?: (viewId: string) => void;
  onViewCreate?: () => void;
  onViewEdit?: (viewId: string) => void;
  onViewDelete?: (viewId: string) => void;
  className?: string;
}

// 테이블 컨테이너 프롭스
export interface TableContainerProps<T extends TableKey = TableKey> {
  table: T;
  className?: string;
  height?: string | number;
  stickyHeader?: boolean;
  showToolbar?: boolean;
  showPagination?: boolean;
  showFooter?: boolean;
  onRowClick?: (row: TableDataMap[T]) => void;
  onRowDoubleClick?: (row: TableDataMap[T]) => void;
  customToolbar?: React.ReactNode;
  customFooter?: React.ReactNode;
}

// 키보드 단축키 설정
export interface KeyboardShortcuts {
  search: string; // 기본: 'ctrl+f' 또는 'cmd+f'
  refresh: string; // 기본: 'f5' 또는 'ctrl+r'
  export: string; // 기본: 'ctrl+e'
  selectAll: string; // 기본: 'ctrl+a'
  clearSelection: string; // 기본: 'escape'
  nextPage: string; // 기본: 'ctrl+right'
  prevPage: string; // 기본: 'ctrl+left'
  firstPage: string; // 기본: 'ctrl+home'
  lastPage: string; // 기본: 'ctrl+end'
  toggleSidebar: string; // 기본: 'ctrl+b'
  switchTable: string; // 기본: 'ctrl+t'
}

// 테이블 성능 메트릭
export interface TablePerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
  filterTime: number;
  sortTime: number;
  totalRows: number;
  visibleRows: number;
  memoryUsage?: number;
}

// 테이블 이벤트 타입
export interface TableEvents<T extends TableKey = TableKey> {
  onTableSwitch: (from: TableKey, to: T) => void;
  onDataLoad: (table: T, data: TableDataMap[T][]) => void;
  onDataError: (table: T, error: Error) => void;
  onFilterChange: (table: T, filters: Record<string, any>) => void;
  onSearchChange: (table: T, search: string) => void;
  onSortChange: (table: T, sorting: TableState['sorting']) => void;
  onSelectionChange: (table: T, selectedRows: string[] | number[]) => void;
  onRowAction: (table: T, action: string, row: TableDataMap[T]) => void;
  onBulkAction: (table: T, action: string, selectedRows: string[] | number[]) => void;
  onExport: (table: T, format: string, data: any) => void;
  onImport: (table: T, file: File, result: any) => void;
  onViewSave: (table: T, view: TableViewConfig) => void;
  onViewLoad: (table: T, view: TableViewConfig) => void;
  onViewDelete: (table: T, viewId: string) => void;
}

// 다중 테이블 훅 옵션
export interface UseMultiTableOptions {
  defaultTable?: TableKey;
  autoLoad?: boolean;
  enableRealtime?: boolean;
  enableKeyboardShortcuts?: boolean;
  persistState?: boolean;
  storageKey?: string;
  onError?: (error: Error) => void;
  events?: Partial<TableEvents>;
}

// 테이블 드래그 앤 드롭 타입
export interface TableDragDropConfig {
  enabled: boolean;
  allowReorder: boolean;
  allowMove: boolean;
  onRowDrop?: (sourceTable: TableKey, targetTable: TableKey, rows: any[]) => Promise<void>;
  onColumnReorder?: (table: TableKey, columns: string[]) => void;
}

// 테이블 가상화 설정
export interface TableVirtualizationConfig {
  enabled: boolean;
  rowHeight: number;
  overscan: number;
  threshold: number; // 가상화를 시작할 행 수
}

// 테이블 접근성 설정
export interface TableAccessibilityConfig {
  announceChanges: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  focusManagement: boolean;
  ariaLabels: {
    table: string;
    toolbar: string;
    pagination: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
  };
}