// Excel 파일 검증 유틸리티

// XLSX 모듈을 any 타입으로 처리
const XLSX = require('xlsx') as any;

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  previewData: any[];
}

export interface ExcelPreProcessResult {
  validData: any[];
  invalidData: Array<{ row: number; data: any; errors: string[] }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * 클라이언트 측 엑셀 파일 사전 검증
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
 * 클라이언트 측 데이터 사전 처리 및 검증
 */
export const preProcessExcelData = async (file: File): Promise<ExcelPreProcessResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[1];
  const sheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(sheet, { 
    range: 3,
    defval: null,
    raw: false
  });

  const validData: any[] = [];
  const invalidData: Array<{ row: number; data: any; errors: string[] }> = [];

  jsonData.forEach((row: any, index: number) => {
    const errors: string[] = [];
    const processedRow = { ...row };

    // col0 생성 (순번)
    processedRow.col0 = index + 1;

    // 필수 필드 검증
    if (!processedRow['년'] || isNaN(Number(processedRow['년']))) {
      errors.push('년도가 유효하지 않습니다.');
    }
    if (!processedRow['월'] || isNaN(Number(processedRow['월']))) {
      errors.push('월이 유효하지 않습니다.');
    }
    if (!processedRow['일'] || isNaN(Number(processedRow['일']))) {
      errors.push('일이 유효하지 않습니다.');
    }

    // 숫자 필드 변환 및 검증
    const numericFields = ['년', '월', '일', '수량', '생산', '잔량', '단가', '발주금액'];
    numericFields.forEach(field => {
      if (processedRow[field] !== undefined && processedRow[field] !== null) {
        const numValue = Number(processedRow[field]);
        if (isNaN(numValue)) {
          processedRow[field] = null;
        } else {
          processedRow[field] = numValue;
        }
      }
    });

    // 문자열 필드 정리
    const stringFields = ['분류', '열1', '발주번호', '코드', '등록번호', '발주처', '제품명', '부속명'];
    stringFields.forEach(field => {
      if (processedRow[field] !== undefined && processedRow[field] !== null) {
        processedRow[field] = String(processedRow[field]).trim();
        if (processedRow[field] === '') {
          processedRow[field] = null;
        }
      }
    });

    if (errors.length > 0) {
      invalidData.push({
        row: index + 1,
        data: processedRow,
        errors
      });
    } else {
      validData.push(processedRow);
    }
  });

  return {
    validData,
    invalidData,
    summary: {
      total: jsonData.length,
      valid: validData.length,
      invalid: invalidData.length
    }
  };
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

/**
 * 처리 시간 예상 계산
 */
export const estimateProcessingTime = (rowCount: number): string => {
  // 대략적인 처리 시간 계산 (1000건당 2-3초)
  const estimatedSeconds = Math.ceil((rowCount / 1000) * 2.5);
  
  if (estimatedSeconds < 60) {
    return `약 ${estimatedSeconds}초`;
  } else {
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    return `약 ${minutes}분 ${seconds}초`;
  }
};