import { ApiProperty } from '@nestjs/swagger';

export class OrderInfoResponseDto {
  @ApiProperty({ description: '주문 ID' })
  col0: number;

  @ApiProperty({ description: '년도', required: false })
  year?: number | null;

  @ApiProperty({ description: '월', required: false })
  month?: number | null;

  @ApiProperty({ description: '일', required: false })
  day?: number | null;

  @ApiProperty({ description: '분류', required: false })
  category?: string | null;

  @ApiProperty({ description: '발주번호', required: false })
  orderNumber?: string | null;

  @ApiProperty({ description: '코드', required: false })
  code?: string | null;

  @ApiProperty({ description: '최종 발주번호', required: false })
  finalorderNumber?: string | null;

  @ApiProperty({ description: '발주처', required: false })
  customer?: string | null;

  @ApiProperty({ description: '제품명', required: false })
  productName?: string | null;

  @ApiProperty({ description: '부속명', required: false })
  partName?: string | null;

  @ApiProperty({ description: '사양', required: false })
  specification?: string | null;

  @ApiProperty({ description: '담당자', required: false })
  manager?: string | null;

  @ApiProperty({ description: '발주수량', required: false })
  quantity?: number | null;

  @ApiProperty({ description: '생산량', required: false })
  production?: number | null;

  @ApiProperty({ description: '잔여량', required: false })
  remaining?: number | null;

  @ApiProperty({ description: '진행상태', required: false })
  status?: string | null;

  @ApiProperty({ description: '출하일', required: false })
  shippingDate?: string | null;

  @ApiProperty({ description: 'D-DAY', required: false })
  dDay?: string | null;

  @ApiProperty({ description: '단가', required: false })
  unitPrice?: number | null;

  @ApiProperty({ description: '발주금액', required: false })
  orderAmount?: number | null;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}