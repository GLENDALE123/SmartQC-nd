import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class DefectResponseDto {
  @ApiProperty({ description: '불량 ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '불량 유형 ID', required: false })
  @Expose()
  defectTypeId?: number;

  @ApiProperty({ description: '커스텀 불량 유형', required: false })
  @Expose()
  customType?: string;

  @ApiProperty({ description: '불량 개수' })
  @Expose()
  count: number;

  @ApiProperty({ description: '불량 상세 정보', required: false })
  @Expose()
  details?: any;

  @ApiProperty({ description: '불량 유형 정보', required: false })
  @Expose()
  defectType?: {
    id: number;
    name: string;
    description?: string;
    color?: string;
  };
}

export class AttachmentResponseDto {
  @ApiProperty({ description: '첨부파일 ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '파일 URL' })
  @Expose()
  url: string;

  @ApiProperty({ description: '파일명' })
  @Expose()
  fileName: string;

  @ApiProperty({ description: '생성일시' })
  @Expose()
  createdAt: Date;
}

export class UnifiedInspectionResponseDto {
  @ApiProperty({ description: '검사 ID' })
  @Expose()
  id: number;

  @ApiProperty({
    description: '검사 유형',
    enum: ['incoming', 'process', 'shipment'],
  })
  @Expose()
  type: 'incoming' | 'process' | 'shipment';

  @ApiProperty({ description: '발주번호 배열' })
  @Expose()
  orderNumbers: string[];

  @ApiProperty({ description: '발주처', required: false })
  @Expose()
  client?: string;

  @ApiProperty({ description: '제품명', required: false })
  @Expose()
  productName?: string;

  @ApiProperty({ description: '부속명', required: false })
  @Expose()
  partName?: string;

  @ApiProperty({ description: '사양', required: false })
  @Expose()
  specification?: string;

  @ApiProperty({ description: '담당자', required: false })
  @Expose()
  manager?: string;

  @ApiProperty({ description: '검사일시' })
  @Expose()
  inspectionDate: Date;

  @ApiProperty({ description: '총 수량' })
  @Expose()
  totalQty: number;

  @ApiProperty({ description: '불량 수량' })
  @Expose()
  defectQty: number;

  @ApiProperty({ description: '비고', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: '상태' })
  @Expose()
  status: string;

  @ApiProperty({ description: '불량 정보', type: [DefectResponseDto] })
  @Expose()
  @Type(() => DefectResponseDto)
  defects: DefectResponseDto[];

  @ApiProperty({ description: '첨부파일', type: [AttachmentResponseDto] })
  @Expose()
  @Type(() => AttachmentResponseDto)
  attachments: AttachmentResponseDto[];

  @ApiProperty({ description: '생성일시' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @Expose()
  updatedAt: Date;

  // 공정검사 특화 필드들
  @ApiProperty({ description: '프라이머', required: false })
  @Expose()
  paintPrimer?: string;

  @ApiProperty({ description: '탑코트', required: false })
  @Expose()
  paintTopcoat?: string;

  @ApiProperty({ description: '라인', required: false })
  @Expose()
  line?: string;

  @ApiProperty({ description: '서브라인', required: false })
  @Expose()
  subLine?: string;

  // 출하검사 특화 필드들
  @ApiProperty({ description: '최종 필링', required: false })
  @Expose()
  finalPeeling?: string;

  @ApiProperty({ description: '외관 검사', required: false })
  @Expose()
  externalCheck?: boolean;
}
