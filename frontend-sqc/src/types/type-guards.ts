// 타입 가드 및 유효성 검사 함수

import { 
  TableKey, 
  TableDataMap, 
  User, 
  Order, 
  DefectType, 
  IncomingInspection,
  ProcessInspection,
  ShipmentInspection,
  UploadLog,
  UserRole,
  InspectionStatus,
  InspectionDraftStatus,
  InspectionType
} from './models';

// 테이블 키 타입 가드
export function isValidTableKey(key: string): key is TableKey {
  const validKeys: TableKey[] = [
    'order', 
    'user', 
    'defectType', 
    'incomingInspection', 
    'processInspection', 
    'shipmentInspection', 
    'uploadLog'
  ];
  return validKeys.includes(key as TableKey);
}

// Enum 타입 가드
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidInspectionStatus(status: string): status is InspectionStatus {
  return Object.values(InspectionStatus).includes(status as InspectionStatus);
}

export function isValidInspectionDraftStatus(status: string): status is InspectionDraftStatus {
  return Object.values(InspectionDraftStatus).includes(status as InspectionDraftStatus);
}

export function isValidInspectionType(type: string): type is InspectionType {
  return Object.values(InspectionType).includes(type as InspectionType);
}

// 모델 타입 가드
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.username === 'string' &&
    typeof obj.name === 'string' &&
    isValidUserRole(obj.role) &&
    typeof obj.isActive === 'boolean' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isOrder(obj: any): obj is Order {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.col0 === 'number' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isDefectType(obj: any): obj is DefectType {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isIncomingInspection(obj: any): obj is IncomingInspection {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    Array.isArray(obj.orderNumbers) &&
    obj.inspectionDate instanceof Date &&
    typeof obj.totalQty === 'number' &&
    typeof obj.defectQty === 'number' &&
    isValidInspectionDraftStatus(obj.status) &&
    Array.isArray(obj.defects) &&
    Array.isArray(obj.attachments) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isProcessInspection(obj: any): obj is ProcessInspection {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    Array.isArray(obj.orderNumbers) &&
    obj.inspectionDate instanceof Date &&
    typeof obj.totalQty === 'number' &&
    typeof obj.defectQty === 'number' &&
    isValidInspectionDraftStatus(obj.status) &&
    Array.isArray(obj.rounds) &&
    Array.isArray(obj.defects) &&
    Array.isArray(obj.attachments) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isShipmentInspection(obj: any): obj is ShipmentInspection {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    Array.isArray(obj.orderNumbers) &&
    obj.inspectionDate instanceof Date &&
    typeof obj.totalQty === 'number' &&
    typeof obj.defectQty === 'number' &&
    isValidInspectionDraftStatus(obj.status) &&
    Array.isArray(obj.rounds) &&
    Array.isArray(obj.attachments) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isUploadLog(obj: any): obj is UploadLog {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.fileName === 'string' &&
    typeof obj.successCount === 'number' &&
    typeof obj.failedCount === 'number' &&
    obj.createdAt instanceof Date
  );
}

// 테이블 데이터 타입 가드
export function isTableData<T extends TableKey>(
  data: any, 
  tableKey: T
): data is TableDataMap[T] {
  switch (tableKey) {
    case 'user':
      return isUser(data);
    case 'order':
      return isOrder(data);
    case 'defectType':
      return isDefectType(data);
    case 'incomingInspection':
      return isIncomingInspection(data);
    case 'processInspection':
      return isProcessInspection(data);
    case 'shipmentInspection':
      return isShipmentInspection(data);
    case 'uploadLog':
      return isUploadLog(data);
    default:
      return false;
  }
}

// 배열 데이터 타입 가드
export function isTableDataArray<T extends TableKey>(
  data: any[], 
  tableKey: T
): data is TableDataMap[T][] {
  return Array.isArray(data) && data.every(item => isTableData(item, tableKey));
}

// 유효성 검사 함수
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// User 유효성 검사
export function validateUser(user: Partial<User>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!user.username || user.username.trim().length === 0) {
    errors.push('사용자명은 필수입니다.');
  } else if (user.username.length < 3) {
    errors.push('사용자명은 3자 이상이어야 합니다.');
  }

  if (!user.name || user.name.trim().length === 0) {
    errors.push('이름은 필수입니다.');
  }

  if (!user.role || !isValidUserRole(user.role)) {
    errors.push('유효한 역할을 선택해야 합니다.');
  }

  if (user.isActive === undefined || user.isActive === null) {
    errors.push('활성 상태를 설정해야 합니다.');
  }

  // 경고사항
  if (user.inspectionType && !['incoming', 'process', 'shipment', 'all'].includes(user.inspectionType)) {
    warnings.push('검사 타입이 유효하지 않습니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Order 유효성 검사
export function validateOrder(order: Partial<Order>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (order.col0 === undefined || order.col0 === null) {
    errors.push('ID는 필수입니다.');
  } else if (order.col0 < 0) {
    errors.push('ID는 0 이상이어야 합니다.');
  }

  if (order.quantity !== undefined && order.quantity !== null && order.quantity < 0) {
    errors.push('발주수량은 0 이상이어야 합니다.');
  }

  if (order.unitPrice !== undefined && order.unitPrice !== null && order.unitPrice < 0) {
    errors.push('단가는 0 이상이어야 합니다.');
  }

  if (order.orderAmount !== undefined && order.orderAmount !== null && order.orderAmount < 0) {
    errors.push('발주금액은 0 이상이어야 합니다.');
  }

  // 경고사항
  if (!order.customer || order.customer.trim().length === 0) {
    warnings.push('발주처 정보가 없습니다.');
  }

  if (!order.productName || order.productName.trim().length === 0) {
    warnings.push('제품명 정보가 없습니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// DefectType 유효성 검사
export function validateDefectType(defectType: Partial<DefectType>): ValidationResult {
  const errors: string[] = [];

  if (!defectType.name || defectType.name.trim().length === 0) {
    errors.push('불량 유형 이름은 필수입니다.');
  } else if (defectType.name.length > 100) {
    errors.push('불량 유형 이름은 100자를 초과할 수 없습니다.');
  }

  if (defectType.description && defectType.description.length > 500) {
    errors.push('설명은 500자를 초과할 수 없습니다.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// IncomingInspection 유효성 검사
export function validateIncomingInspection(inspection: Partial<IncomingInspection>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(inspection.orderNumbers) || inspection.orderNumbers.length === 0) {
    errors.push('발주번호는 최소 하나 이상 필요합니다.');
  }

  if (!inspection.inspectionDate) {
    errors.push('검사일은 필수입니다.');
  } else if (inspection.inspectionDate > new Date()) {
    warnings.push('검사일이 미래 날짜입니다.');
  }

  if (inspection.totalQty === undefined || inspection.totalQty === null) {
    errors.push('총 수량은 필수입니다.');
  } else if (inspection.totalQty < 0) {
    errors.push('총 수량은 0 이상이어야 합니다.');
  }

  if (inspection.defectQty === undefined || inspection.defectQty === null) {
    errors.push('불량 수량은 필수입니다.');
  } else if (inspection.defectQty < 0) {
    errors.push('불량 수량은 0 이상이어야 합니다.');
  }

  if (inspection.totalQty !== undefined && inspection.defectQty !== undefined && 
      inspection.defectQty > inspection.totalQty) {
    errors.push('불량 수량은 총 수량을 초과할 수 없습니다.');
  }

  if (!inspection.status || !isValidInspectionDraftStatus(inspection.status)) {
    errors.push('유효한 상태를 선택해야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// 일반적인 필드 유효성 검사 함수
export function validateField(
  value: any, 
  fieldName: string, 
  rules: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'array';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
  }
): ValidationResult {
  const errors: string[] = [];

  // 필수 필드 검사
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName}은(는) 필수입니다.`);
    return { valid: false, errors };
  }

  // 값이 없으면 추가 검사 생략
  if (value === undefined || value === null || value === '') {
    return { valid: true, errors: [] };
  }

  // 타입 검사
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName}은(는) 문자열이어야 합니다.`);
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${fieldName}은(는) 숫자여야 합니다.`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName}은(는) 불린값이어야 합니다.`);
        }
        break;
      case 'date':
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          errors.push(`${fieldName}은(는) 유효한 날짜여야 합니다.`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName}은(는) 배열이어야 합니다.`);
        }
        break;
    }
  }

  // 문자열 길이 검사
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName}은(는) ${rules.minLength}자 이상이어야 합니다.`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName}은(는) ${rules.maxLength}자를 초과할 수 없습니다.`);
    }
  }

  // 숫자 범위 검사
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${fieldName}은(는) ${rules.min} 이상이어야 합니다.`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${fieldName}은(는) ${rules.max} 이하여야 합니다.`);
    }
  }

  // 정규식 패턴 검사
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    errors.push(`${fieldName}의 형식이 올바르지 않습니다.`);
  }

  // Enum 값 검사
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`${fieldName}은(는) 유효한 값이어야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 배치 유효성 검사
export function validateBatch<T extends TableKey>(
  data: any[], 
  tableKey: T
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('데이터는 배열이어야 합니다.');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    let validationResult: ValidationResult;

    switch (tableKey) {
      case 'user':
        validationResult = validateUser(item);
        break;
      case 'order':
        validationResult = validateOrder(item);
        break;
      case 'defectType':
        validationResult = validateDefectType(item);
        break;
      case 'incomingInspection':
        validationResult = validateIncomingInspection(item);
        break;
      default:
        validationResult = { valid: true, errors: [] };
    }

    if (!validationResult.valid) {
      validationResult.errors.forEach(error => {
        errors.push(`행 ${index + 1}: ${error}`);
      });
    }

    if (validationResult.warnings) {
      validationResult.warnings.forEach(warning => {
        warnings.push(`행 ${index + 1}: ${warning}`);
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}