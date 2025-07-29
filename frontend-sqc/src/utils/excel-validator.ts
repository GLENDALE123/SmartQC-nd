// Excel 파일 검증 유틸리티

// XLSX 모듈을 ES 모듈 방식으로 import
import * as XLSX from 'xlsx';

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  previewData: any[];
}

/**
 * 기본 엑셀 파일 검증
 */
export const validateExcelFile = async (file: File): Promise<ExcelValidationResult> => {
  const result: ExcelValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    rowCount: 0,
    previewData: []
  };

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // 2번째 시트 확인
    if (workbook.SheetNames.length < 2) {
      result.errors.push('엑셀 파일에 2번째 시트가 없습니다.');
      result.isValid = false;
      return result;
    }

    const sheetName = workbook.SheetNames[1];
    const sheet = workbook.Sheets[sheetName];
    
    // 데이터 읽기 (5번째 행부터)
    const jsonData = XLSX.utils.sheet_to_json(sheet, { 
      range: 3,
      defval: null,
      raw: false
    });

    result.rowCount = jsonData.length;
    result.previewData = jsonData.slice(0, 5); // 처음 5행만 미리보기

    // 기본 검증
    if (jsonData.length === 0) {
      result.errors.push('데이터가 없습니다.');
      result.isValid = false;
    }

    // 대용량 파일 경고
    if (jsonData.length > 5000) {
      result.warnings.push(`대용량 파일입니다 (${jsonData.length}건). 처리 시간이 오래 걸릴 수 있습니다.`);
    }

    // 필수 컬럼 확인
    const requiredColumns = ['년', '월', '일', '분류'];
    const firstRow = jsonData[0] as any;
    if (firstRow) {
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      if (missingColumns.length > 0) {
        result.errors.push(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
        result.isValid = false;
      }
    }

  } catch (error: unknown) {
    result.errors.push(`파일 읽기 오류: ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};