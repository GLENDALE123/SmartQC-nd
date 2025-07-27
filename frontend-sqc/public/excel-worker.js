// 엑셀 처리 전용 웹 워커
importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

// 워커 상태 관리
let isProcessing = false;
let currentProgress = 0;

// 메인 스레드로 진행률 전송
function updateProgress(progress, message, data = null) {
  currentProgress = progress;
  self.postMessage({
    type: 'progress',
    progress,
    message,
    data
  });
}

// 에러 전송
function sendError(error, details = null) {
  self.postMessage({
    type: 'error',
    error: error.message || error,
    details
  });
}

// 완료 전송
function sendComplete(result) {
  self.postMessage({
    type: 'complete',
    result
  });
}

// 엑셀 파일 검증
function validateExcelFile(file) {
  try {
    updateProgress(5, '파일 검증 중...');
    
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('파일 크기가 10MB를 초과합니다.');
    }
    
    // 파일 확장자 검증
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      throw new Error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
    
    updateProgress(10, '파일 검증 완료');
    
    return {
      isValid: true,
      fileSize: file.size,
      fileName: file.name,
      fileType: fileExtension
    };
    
  } catch (error) {
    sendError(error);
    return { isValid: false, error: error.message };
  }
}

// 엑셀 데이터 파싱 및 검증
async function parseAndValidateExcel(file) {
  try {
    updateProgress(15, '엑셀 파일 읽는 중...');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    updateProgress(25, '워크시트 분석 중...');
    
    if (workbook.SheetNames.length < 2) {
      throw new Error('엑셀 파일에 2번째 시트가 없습니다.');
    }
    
    const sheetName = workbook.SheetNames[1]; // 2번째 시트 사용
    const sheet = workbook.Sheets[sheetName];
    
    updateProgress(35, '데이터 추출 중...');
    
    // 3행부터 데이터 추출 (헤더 제외)
    const jsonData = XLSX.utils.sheet_to_json(sheet, { 
      range: 3,
      defval: null,
      raw: false
    });
    
    updateProgress(50, '데이터 검증 중...');
    
    const validationResult = {
      total: jsonData.length,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: []
    };
    
    const validatedData = [];
    
    // 데이터 검증 및 변환
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 1;
      
      // 진행률 업데이트 (50-80%)
      if (i % 100 === 0) {
        const progress = 50 + ((i / jsonData.length) * 30);
        updateProgress(progress, `데이터 검증 중... (${i}/${jsonData.length})`);
      }
      
      try {
        const validatedRow = validateAndTransformRow(row, rowIndex);
        if (validatedRow) {
          validatedData.push(validatedRow);
          validationResult.valid++;
        } else {
          validationResult.invalid++;
        }
      } catch (error) {
        validationResult.invalid++;
        validationResult.errors.push({
          row: rowIndex,
          error: error.message
        });
      }
    }
    
    updateProgress(85, '검증 결과 정리 중...');
    
    const result = {
      data: validatedData,
      summary: validationResult,
      rowCount: jsonData.length,
      validCount: validationResult.valid,
      invalidCount: validationResult.invalid
    };
    
    updateProgress(100, '처리 완료');
    return result;
    
  } catch (error) {
    sendError(error);
    return null;
  }
}

// 행 데이터 검증 및 변환
function validateAndTransformRow(row, rowIndex) {
  try {
    // 필수 필드 검증
    const col0 = parseInt(row['col0'] || row['번호'] || '');
    if (!col0 || isNaN(col0)) {
      throw new Error('col0(번호) 필드가 유효하지 않습니다.');
    }
    
    // 문자열 필드 정제 (XSS 방지)
    const sanitizeString = (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (str === '') return null;
      
      // HTML 태그 제거
      const cleaned = str.replace(/<[^>]*>/g, '');
      
      // 길이 제한 (DoS 방지)
      if (cleaned.length > 500) {
        return cleaned.substring(0, 500);
      }
      
      return cleaned;
    };
    
    // 숫자 필드 파싱
    const parseNumber = (value) => {
      if (!value) return null;
      const num = parseFloat(value);
      if (isNaN(num) || !isFinite(num)) return null;
      if (num < 0 || num > 999999999) return null; // 범위 제한
      return num;
    };
    
    // 데이터 변환
    const transformedRow = {
      col0,
      year: parseNumber(row['년도'] || row['year']),
      month: parseNumber(row['월'] || row['month']),
      day: parseNumber(row['일'] || row['day']),
      category: sanitizeString(row['분류'] || row['category']),
      finalorderNumber: sanitizeString(row['발주번호'] || row['finalorderNumber']),
      orderNumber: sanitizeString(row['주문번호'] || row['orderNumber']),
      code: sanitizeString(row['코드'] || row['code']),
      registration: sanitizeString(row['등록'] || row['registration']),
      col2: sanitizeString(row['col2']),
      customer: sanitizeString(row['고객사'] || row['customer']),
      productName: sanitizeString(row['제품명'] || row['productName']),
      partName: sanitizeString(row['부품명'] || row['partName']),
      quantity: parseNumber(row['수량'] || row['quantity']),
      specification: sanitizeString(row['규격'] || row['specification']),
      postProcess: sanitizeString(row['후가공'] || row['postProcess']),
      production: parseNumber(row['생산'] || row['production']),
      remaining: parseNumber(row['잔량'] || row['remaining']),
      status: sanitizeString(row['상태'] || row['status']),
      sample: sanitizeString(row['샘플'] || row['sample']),
      shippingDate: sanitizeString(row['출하일'] || row['shippingDate']),
      dDay: sanitizeString(row['D-Day'] || row['dDay']),
      manager: sanitizeString(row['담당자'] || row['manager']),
      shipping: sanitizeString(row['출하'] || row['shipping']),
      jig: sanitizeString(row['지그'] || row['jig']),
      registration2: sanitizeString(row['등록2'] || row['registration2']),
      category2: sanitizeString(row['분류2'] || row['category2']),
      unitPrice: parseNumber(row['단가'] || row['unitPrice']),
      orderAmount: parseNumber(row['주문금액'] || row['orderAmount']),
      etc: sanitizeString(row['기타'] || row['etc']),
      category3: sanitizeString(row['분류3'] || row['category3']),
      salesManager: sanitizeString(row['영업담당자'] || row['salesManager'])
    };
    
    // 비즈니스 로직 검증
    if (!transformedRow.finalorderNumber && !transformedRow.productName) {
      throw new Error('발주번호와 제품명 중 하나는 필수입니다.');
    }
    
    return transformedRow;
    
  } catch (error) {
    throw new Error(`행 ${rowIndex}: ${error.message}`);
  }
}

// 청크 단위로 데이터 분할
function chunkData(data, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

// 메시지 핸들러
self.onmessage = async function(e) {
  const { action, file, data, options = {} } = e.data;
  
  if (isProcessing) {
    sendError('이미 처리 중인 작업이 있습니다.');
    return;
  }
  
  isProcessing = true;
  currentProgress = 0;
  
  try {
    switch (action) {
      case 'validate':
        updateProgress(0, '파일 검증 시작...');
        const validationResult = validateExcelFile(file);
        sendComplete(validationResult);
        break;
        
      case 'parse':
        updateProgress(0, '엑셀 파싱 시작...');
        const parseResult = await parseAndValidateExcel(file);
        if (parseResult) {
          sendComplete(parseResult);
        }
        break;
        
      case 'chunk':
        updateProgress(0, '데이터 청크 분할 시작...');
        const chunkSize = options.chunkSize || 1000;
        const chunks = chunkData(data, chunkSize);
        updateProgress(100, `${chunks.length}개 청크로 분할 완료`);
        sendComplete({
          chunks,
          totalChunks: chunks.length,
          chunkSize
        });
        break;
        
      default:
        sendError('알 수 없는 액션입니다: ' + action);
    }
  } catch (error) {
    sendError(error);
  } finally {
    isProcessing = false;
  }
};

// 워커 초기화 완료 신호
self.postMessage({
  type: 'ready',
  message: '엑셀 처리 워커가 준비되었습니다.'
});