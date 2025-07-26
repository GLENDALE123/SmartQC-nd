import { SetMetadata } from '@nestjs/common';

export const INSPECTION_PERMISSION_KEY = 'inspectionPermission';

/**
 * 검사 권한 데코레이터
 * @param inspectionType 필요한 검사 유형 ('incoming', 'process', 'shipment')
 */
export const RequireInspectionPermission = (inspectionType: string) =>
  SetMetadata(INSPECTION_PERMISSION_KEY, inspectionType);