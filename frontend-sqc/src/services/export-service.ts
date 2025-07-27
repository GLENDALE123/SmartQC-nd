import { Order } from '../types/models';
import { orderApi } from '../api/orders';

// Export 포맷 타입
export type ExportFormat = 'csv' | 'excel' | 'json';

// Export 옵션 인터페이스
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  selectedFields?: string[];
  dateFormat?: 'iso' | 'local' | 'short';
  encoding?: 'utf-8' | 'utf-8-bom';
}

// CSV Export 옵션
export interface CsvExportOptions extends ExportOptions {
  format: 'csv';
  delimiter?: ',' | ';' | '\t';
  quoteChar?: '"' | "'";
  escapeChar?: '\\';
  lineEnding?: '\n' | '\r\n';
}

// Excel Export 옵션
export interface ExcelExportOptions extends ExportOptions {
  format: 'excel';
  sheetName?: string;
  autoWidth?: boolean;
  freezeHeader?: boolean;
}

// JSON Export 옵션
export interface JsonExportOptions extends ExportOptions {
  format: 'json';
  pretty?: boolean;
  indent?: number;
}

// 필드 정의
export interface ExportField {
  key: keyof Order;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  format?: (value: any) => string;
}

// Order 테이블 내보내기 필드 정의
export const ORDER_EXPORT_FIELDS: ExportField[] = [
  { key: 'col0', label: 'ID', type: 'number' },
  { key: 'finalorderNumber', label: '발주번호', type: 'string' },
  { key: 'orderNumber', label: '주문번호', type: 'string' },
  { key: 'code', label: '코드', type: 'string' },
  { key: 'customer', label: '발주처', type: 'string' },
  { key: 'productName', label: '제품명', type: 'string' },
  { key: 'partName', label: '부속명', type: 'string' },
  { key: 'quantity', label: '발주수량', type: 'number' },
  { key: 'specification', label: '사양', type: 'string' },
  { key: 'production', label: '생산량', type: 'number' },
  { key: 'remaining', label: '잔여량', type: 'number' },
  { key: 'status', label: '진행상태', type: 'string' },
  { key: 'shippingDate', label: '출하일', type: 'string' },
  { key: 'dDay', label: 'D-DAY', type: 'string' },
  { key: 'manager', label: '담당자', type: 'string' },
  { key: 'unitPrice', label: '단가', type: 'currency' },
  { key: 'orderAmount', label: '발주금액', type: 'currency' },
  { key: 'category', label: '분류', type: 'string' },
  { key: 'category2', label: '구분', type: 'string' },
  { key: 'salesManager', label: '매출담당', type: 'string' },
  { key: 'createdAt', label: '생성일', type: 'date' },
  { key: 'updatedAt', label: '수정일', type: 'date' },
];

// Export Service 클래스
export class ExportService {
  private static instance: ExportService;

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Order 데이터 내보내기 (메인 함수)
   */
  async exportOrders(
    data: Order[],
    options: CsvExportOptions | ExcelExportOptions | JsonExportOptions
  ): Promise<void> {
    try {
      switch (options.format) {
        case 'csv':
          await this.exportToCsv(data, options as CsvExportOptions);
          break;
        case 'excel':
          await this.exportToExcel(data, options as ExcelExportOptions);
          break;
        case 'json':
          await this.exportToJson(data, options as JsonExportOptions);
          break;
        default:
          throw new Error(`지원하지 않는 내보내기 형식: ${(options as any).format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * 필터링된 데이터 내보내기 (API 호출)
   */
  async exportFilteredOrders(
    filters: Record<string, any>,
    selectedIds: number[] | undefined,
    options: CsvExportOptions | ExcelExportOptions | JsonExportOptions
  ): Promise<void> {
    try {
      // TODO: 실제 백엔드 내보내기 API 구현 시 사용
      // const exportRequest: ExportRequest = {
      //   table: 'order',
      //   format: options.format,
      //   filters,
      //   ids: selectedIds,
      //   fields: options.selectedFields,
      //   includeHeaders: options.includeHeaders !== false,
      //   filename: options.filename || this.generateFilename(options.format),
      // };

      // TODO: 실제 백엔드 내보내기 API 호출
      // const response = await orderApi.exportOrders(exportRequest);
      // window.open(response.data.downloadUrl, '_blank');

      // 임시로 클라이언트 사이드 내보내기 사용
      console.warn('Server-side export not implemented yet, using client-side export');
      
      // 모든 데이터를 가져와서 클라이언트에서 필터링
      const allOrdersResponse = await orderApi.getOrders({ pageSize: 10000 });
      if (!allOrdersResponse.success || !allOrdersResponse.data) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }

      let filteredData = allOrdersResponse.data.data;

      // 선택된 ID가 있으면 필터링
      if (selectedIds && selectedIds.length > 0) {
        filteredData = filteredData.filter(order => selectedIds.includes(order.col0));
      }

      // 필터 적용
      if (filters && Object.keys(filters).length > 0) {
        filteredData = this.applyFilters(filteredData, filters);
      }

      await this.exportOrders(filteredData, options);
    } catch (error) {
      console.error('Filtered export failed:', error);
      throw error;
    }
  }

  /**
   * CSV 내보내기
   */
  private async exportToCsv(data: Order[], options: CsvExportOptions): Promise<void> {
    const {
      filename = this.generateFilename('csv'),
      includeHeaders = true,
      selectedFields,
      delimiter = ',',
      quoteChar = '"',
      lineEnding = '\n',
      encoding = 'utf-8-bom',
    } = options;

    const fields = this.getExportFields(selectedFields);
    const rows: string[] = [];

    // 헤더 추가
    if (includeHeaders) {
      const headerRow = fields.map(field => this.escapeValue(field.label, quoteChar, delimiter)).join(delimiter);
      rows.push(headerRow);
    }

    // 데이터 행 추가
    data.forEach(order => {
      const row = fields.map(field => {
        const value = this.formatValue(order[field.key], field, options);
        return this.escapeValue(value, quoteChar, delimiter);
      }).join(delimiter);
      rows.push(row);
    });

    const csvContent = rows.join(lineEnding);
    const blob = this.createBlob(csvContent, 'text/csv', encoding);
    this.downloadBlob(blob, filename);
  }

  /**
   * Excel 내보내기 (CSV 형식으로 대체, 실제 Excel은 라이브러리 필요)
   */
  private async exportToExcel(data: Order[], options: ExcelExportOptions): Promise<void> {
    // 실제 Excel 내보내기는 xlsx 라이브러리가 필요하므로 CSV로 대체
    console.warn('Excel export not fully implemented, using CSV format');
    
    const csvOptions: CsvExportOptions = {
      ...options,
      format: 'csv',
      filename: options.filename?.replace('.xlsx', '.csv') || this.generateFilename('csv'),
    };

    await this.exportToCsv(data, csvOptions);
  }

  /**
   * JSON 내보내기
   */
  private async exportToJson(data: Order[], options: JsonExportOptions): Promise<void> {
    const {
      filename = this.generateFilename('json'),
      selectedFields,
      pretty = true,
      indent = 2,
    } = options;

    const fields = this.getExportFields(selectedFields);
    
    const jsonData = data.map(order => {
      const exportOrder: Record<string, any> = {};
      fields.forEach(field => {
        exportOrder[field.label] = this.formatValue(order[field.key], field, options);
      });
      return exportOrder;
    });

    const jsonContent = pretty 
      ? JSON.stringify(jsonData, null, indent)
      : JSON.stringify(jsonData);

    const blob = this.createBlob(jsonContent, 'application/json', 'utf-8');
    this.downloadBlob(blob, filename);
  }

  /**
   * 내보낼 필드 목록 가져오기
   */
  private getExportFields(selectedFields?: string[]): ExportField[] {
    if (!selectedFields || selectedFields.length === 0) {
      return ORDER_EXPORT_FIELDS;
    }

    return ORDER_EXPORT_FIELDS.filter(field => 
      selectedFields.includes(field.key as string)
    );
  }

  /**
   * 값 포맷팅
   */
  private formatValue(value: any, field: ExportField, options: ExportOptions): string {
    if (value === null || value === undefined) {
      return '';
    }

    // 커스텀 포맷터가 있으면 사용
    if (field.format) {
      return field.format(value);
    }

    // 타입별 기본 포맷팅
    switch (field.type) {
      case 'date':
        return this.formatDate(value, options.dateFormat);
      case 'currency':
        return this.formatCurrency(value);
      case 'number':
        return typeof value === 'number' ? value.toString() : String(value);
      case 'boolean':
        return value ? '예' : '아니오';
      case 'string':
      default:
        return String(value);
    }
  }

  /**
   * 날짜 포맷팅
   */
  private formatDate(date: Date | string, format: ExportOptions['dateFormat'] = 'local'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    switch (format) {
      case 'iso':
        return dateObj.toISOString();
      case 'short':
        return dateObj.toLocaleDateString('ko-KR');
      case 'local':
      default:
        return dateObj.toLocaleString('ko-KR');
    }
  }

  /**
   * 통화 포맷팅
   */
  private formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) {
      return '';
    }

    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }

  /**
   * CSV 값 이스케이프 처리
   */
  private escapeValue(value: string, quoteChar: string, delimiter: string): string {
    const stringValue = String(value);
    
    // 구분자, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
    if (stringValue.includes(delimiter) || stringValue.includes(quoteChar) || stringValue.includes('\n') || stringValue.includes('\r')) {
      // 따옴표 이스케이프 (따옴표를 두 개로)
      const escapedValue = stringValue.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
      return quoteChar + escapedValue + quoteChar;
    }
    
    return stringValue;
  }

  /**
   * 필터 적용
   */
  private applyFilters(data: Order[], filters: Record<string, any>): Order[] {
    return data.filter(order => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) {
          return true;
        }

        const orderValue = order[key as keyof Order];

        if (Array.isArray(value)) {
          return value.includes(orderValue);
        }

        if (typeof value === 'string') {
          return String(orderValue).toLowerCase().includes(value.toLowerCase());
        }

        return orderValue === value;
      });
    });
  }

  /**
   * Blob 생성
   */
  private createBlob(content: string, mimeType: string, encoding: string): Blob {
    if (encoding === 'utf-8-bom') {
      // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const contentArray = new TextEncoder().encode(content);
      const blobContent = new Uint8Array(bom.length + contentArray.length);
      blobContent.set(bom);
      blobContent.set(contentArray, bom.length);
      return new Blob([blobContent], { type: mimeType });
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * 파일 다운로드
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 메모리 정리
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * 파일명 생성
   */
  private generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `orders_${timestamp}.${format}`;
  }

  /**
   * 내보내기 미리보기 (처음 몇 행만)
   */
  async previewExport(
    data: Order[],
    options: ExportOptions,
    previewRows: number = 5
  ): Promise<string> {
    const previewData = data.slice(0, previewRows);
    
    if (options.format === 'csv') {
      const fields = this.getExportFields(options.selectedFields);
      const rows: string[] = [];

      // 헤더
      if (options.includeHeaders !== false) {
        rows.push(fields.map(f => f.label).join(','));
      }

      // 데이터 행
      previewData.forEach(order => {
        const row = fields.map(field => 
          this.formatValue(order[field.key], field, options)
        ).join(',');
        rows.push(row);
      });

      return rows.join('\n');
    }

    if (options.format === 'json') {
      const fields = this.getExportFields(options.selectedFields);
      const jsonData = previewData.map(order => {
        const exportOrder: Record<string, any> = {};
        fields.forEach(field => {
          exportOrder[field.label] = this.formatValue(order[field.key], field, options);
        });
        return exportOrder;
      });

      return JSON.stringify(jsonData, null, 2);
    }

    return 'Preview not available for this format';
  }
}

// 싱글톤 인스턴스 내보내기
export const exportService = ExportService.getInstance();

// 편의 함수들
export const exportHelpers = {
  /**
   * 기본 CSV 내보내기
   */
  exportOrdersToCsv: async (data: Order[], filename?: string) => {
    await exportService.exportOrders(data, {
      format: 'csv',
      filename,
      includeHeaders: true,
      encoding: 'utf-8-bom',
    });
  },

  /**
   * 선택된 필드만 CSV 내보내기
   */
  exportSelectedFieldsToCsv: async (
    data: Order[], 
    fields: string[], 
    filename?: string
  ) => {
    await exportService.exportOrders(data, {
      format: 'csv',
      filename,
      selectedFields: fields,
      includeHeaders: true,
      encoding: 'utf-8-bom',
    });
  },

  /**
   * JSON 내보내기
   */
  exportOrdersToJson: async (data: Order[], filename?: string) => {
    await exportService.exportOrders(data, {
      format: 'json',
      filename,
      pretty: true,
      indent: 2,
    });
  },

  /**
   * 필터링된 데이터 내보내기
   */
  exportFilteredOrdersToCsv: async (
    filters: Record<string, any>,
    selectedIds?: number[],
    filename?: string
  ) => {
    await exportService.exportFilteredOrders(filters, selectedIds, {
      format: 'csv',
      filename,
      includeHeaders: true,
      encoding: 'utf-8-bom',
    });
  },

  /**
   * 사용 가능한 내보내기 필드 목록
   */
  getAvailableFields: () => ORDER_EXPORT_FIELDS,

  /**
   * 내보내기 미리보기
   */
  previewCsvExport: async (data: Order[], fields?: string[]) => {
    return exportService.previewExport(data, {
      format: 'csv',
      selectedFields: fields,
      includeHeaders: true,
    });
  },
};