// 테이블 관련 유틸리티 함수

import { TableKey, TableDataMap } from '../types/models';
import { TableConfig, ColumnConfig, TableState } from '../types/table-config';
import { tableConfigs } from '../config/table-configs';

// 테이블 설정 가져오기
export function getTableConfig<T extends TableKey>(tableKey: T): TableConfig<T> {
  return tableConfigs[tableKey] as TableConfig<T>;
}

// 테이블 이름 가져오기
export function getTableName(tableKey: TableKey): string {
  return tableConfigs[tableKey]?.name || tableKey;
}

// 테이블 아이콘 가져오기
export function getTableIcon(tableKey: TableKey): string | undefined {
  return tableConfigs[tableKey]?.icon;
}

// 컬럼 설정 가져오기
export function getColumnConfig(tableKey: TableKey, columnKey: string): ColumnConfig | undefined {
  const config = tableConfigs[tableKey];
  return config?.columns.find(col => col.key === columnKey);
}

// 검색 가능한 필드 가져오기
export function getSearchableFields(tableKey: TableKey): string[] {
  return tableConfigs[tableKey]?.searchableFields || [];
}

// 필터 가능한 필드 가져오기
export function getFilterableFields(tableKey: TableKey): string[] {
  return tableConfigs[tableKey]?.filterableFields || [];
}

// 날짜 필드 가져오기
export function getDateFields(tableKey: TableKey): string[] {
  return tableConfigs[tableKey]?.dateFields || [];
}

// 정렬 가능한 필드 가져오기
export function getSortableFields(tableKey: TableKey): string[] {
  return tableConfigs[tableKey]?.sortableFields || [];
}

// 기본 정렬 설정 가져오기
export function getDefaultSort(tableKey: TableKey): { field: string; direction: 'asc' | 'desc' } | undefined {
  return tableConfigs[tableKey]?.defaultSort;
}

// 기본 페이지 크기 가져오기
export function getDefaultPageSize(tableKey: TableKey): number {
  return tableConfigs[tableKey]?.pagination?.defaultPageSize || 20;
}

// 페이지 크기 옵션 가져오기
export function getPageSizeOptions(tableKey: TableKey): number[] {
  return tableConfigs[tableKey]?.pagination?.pageSizeOptions || [10, 20, 50, 100];
}

// 테이블 기능 확인
export function hasFeature(tableKey: TableKey, feature: keyof NonNullable<TableConfig['features']>): boolean {
  return tableConfigs[tableKey]?.features?.[feature] ?? false;
}

// 컬럼 가시성 초기값 생성
export function getInitialColumnVisibility(tableKey: TableKey): Record<string, boolean> {
  const config = tableConfigs[tableKey];
  if (!config) return {};
  
  return config.columns.reduce((acc, column) => {
    acc[column.key] = column.visible ?? true;
    return acc;
  }, {} as Record<string, boolean>);
}

// 테이블 상태 초기값 생성
export function getInitialTableState<T extends TableKey>(tableKey: T): TableState<T> {
  const defaultSort = getDefaultSort(tableKey);
  
  return {
    currentTable: tableKey,
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: getDefaultPageSize(tableKey),
      total: 0,
      totalPages: 0
    },
    sorting: defaultSort ? [defaultSort] : [],
    filters: {},
    search: '',
    selectedRows: [],
    columnVisibility: getInitialColumnVisibility(tableKey),
    currentView: undefined
  };
}

// 컬럼 타입에 따른 정렬 함수
export function getSortFunction(columnType: ColumnConfig['type']) {
  switch (columnType) {
    case 'number':
    case 'currency':
      return (a: any, b: any) => {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return numA - numB;
      };
    
    case 'date':
    case 'datetime':
      return (a: any, b: any) => {
        const dateA = new Date(a).getTime() || 0;
        const dateB = new Date(b).getTime() || 0;
        return dateA - dateB;
      };
    
    case 'boolean':
      return (a: any, b: any) => {
        return (a === true ? 1 : 0) - (b === true ? 1 : 0);
      };
    
    case 'text':
    case 'enum':
    case 'badge':
    default:
      return (a: any, b: any) => {
        const strA = String(a || '').toLowerCase();
        const strB = String(b || '').toLowerCase();
        return strA.localeCompare(strB);
      };
  }
}

// 컬럼 타입에 따른 필터 함수
export function getFilterFunction(columnType: ColumnConfig['type']) {
  switch (columnType) {
    case 'number':
    case 'currency':
      return (value: any, filterValue: any) => {
        if (!filterValue) return true;
        const num = parseFloat(value) || 0;
        const filter = parseFloat(filterValue) || 0;
        return num === filter;
      };
    
    case 'boolean':
      return (value: any, filterValue: any) => {
        if (filterValue === undefined || filterValue === null || filterValue === '') return true;
        return Boolean(value) === Boolean(filterValue);
      };
    
    case 'date':
    case 'datetime':
      return (value: any, filterValue: any) => {
        if (!filterValue) return true;
        const date = new Date(value);
        const filterDate = new Date(filterValue);
        return date.toDateString() === filterDate.toDateString();
      };
    
    case 'array':
      return (value: any[], filterValue: any) => {
        if (!filterValue) return true;
        if (!Array.isArray(value)) return false;
        return value.some(item => 
          String(item).toLowerCase().includes(String(filterValue).toLowerCase())
        );
      };
    
    case 'text':
    case 'enum':
    case 'badge':
    default:
      return (value: any, filterValue: any) => {
        if (!filterValue) return true;
        return String(value || '').toLowerCase().includes(String(filterValue).toLowerCase());
      };
  }
}

// 검색 함수
export function searchInRow<T extends TableKey>(
  row: TableDataMap[T], 
  searchTerm: string, 
  tableKey: T
): boolean {
  if (!searchTerm) return true;
  
  const searchableFields = getSearchableFields(tableKey);
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return searchableFields.some(field => {
    const value = (row as any)[field];
    if (value === null || value === undefined) return false;
    
    if (Array.isArray(value)) {
      return value.some(item => 
        String(item).toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return String(value).toLowerCase().includes(lowerSearchTerm);
  });
}

// 데이터 포맷팅 함수
export function formatCellValue(value: any, column: ColumnConfig): string {
  if (value === null || value === undefined) return '';
  
  switch (column.type) {
    case 'currency':
      const currency = column.format || 'KRW';
      const num = parseFloat(value) || 0;
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: currency === 'KRW' ? 'KRW' : 'USD'
      }).format(num);
    
    case 'number':
      return new Intl.NumberFormat('ko-KR').format(parseFloat(value) || 0);
    
    case 'date':
      const dateFormat = column.format || 'YYYY-MM-DD';
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      if (dateFormat === 'YYYY-MM-DD') {
        return date.toISOString().split('T')[0];
      }
      return date.toLocaleDateString('ko-KR');
    
    case 'datetime':
      const datetimeFormat = column.format || 'YYYY-MM-DD HH:mm:ss';
      const datetime = new Date(value);
      if (isNaN(datetime.getTime())) return '';
      
      if (datetimeFormat === 'YYYY-MM-DD HH:mm:ss') {
        return datetime.toISOString().replace('T', ' ').substring(0, 19);
      }
      return datetime.toLocaleString('ko-KR');
    
    case 'boolean':
      return value ? '예' : '아니오';
    
    case 'array':
      if (!Array.isArray(value)) return String(value);
      return value.join(', ');
    
    case 'badge':
    case 'enum':
      const option = column.enumOptions?.find(opt => opt.value === value);
      return option?.label || String(value);
    
    default:
      return String(value);
  }
}

// 테이블 데이터 유효성 검사
export function validateTableData<T extends TableKey>(
  data: any[], 
  tableKey: T
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getTableConfig(tableKey);
  
  if (!Array.isArray(data)) {
    errors.push('데이터는 배열이어야 합니다.');
    return { valid: false, errors };
  }
  
  data.forEach((row, index) => {
    if (typeof row !== 'object' || row === null) {
      errors.push(`행 ${index + 1}: 객체가 아닙니다.`);
      return;
    }
    
    // 필수 필드 검사 (ID 필드)
    const idColumn = config.columns.find(col => col.key === 'id' || col.key === 'col0');
    if (idColumn && (row[idColumn.key] === null || row[idColumn.key] === undefined)) {
      errors.push(`행 ${index + 1}: ${idColumn.label} 필드가 필요합니다.`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// 테이블 내보내기 데이터 준비
export function prepareExportData<T extends TableKey>(
  data: TableDataMap[T][], 
  tableKey: T,
  selectedColumns?: string[]
): any[] {
  const config = getTableConfig(tableKey);
  const columnsToExport = selectedColumns 
    ? config.columns.filter(col => selectedColumns.includes(col.key))
    : config.columns.filter(col => col.visible !== false);
  
  return data.map(row => {
    const exportRow: any = {};
    columnsToExport.forEach(column => {
      const value = (row as any)[column.key];
      exportRow[column.label] = formatCellValue(value, column);
    });
    return exportRow;
  });
}

// 테이블 통계 계산
export function calculateTableStats<T extends TableKey>(
  data: TableDataMap[T][], 
  tableKey: T
): Record<string, any> {
  const config = getTableConfig(tableKey);
  const stats: Record<string, any> = {
    totalRows: data.length,
    columns: config.columns.length
  };
  
  // 숫자 컬럼 통계
  config.columns
    .filter(col => col.type === 'number' || col.type === 'currency')
    .forEach(column => {
      const values = data
        .map(row => parseFloat((row as any)[column.key]) || 0)
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        stats[column.key] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });
  
  // 카테고리 컬럼 통계
  config.columns
    .filter(col => col.type === 'enum' || col.type === 'badge')
    .forEach(column => {
      const values = data.map(row => (row as any)[column.key]).filter(Boolean);
      const counts: Record<string, number> = {};
      
      values.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
      });
      
      stats[column.key] = counts;
    });
  
  return stats;
}