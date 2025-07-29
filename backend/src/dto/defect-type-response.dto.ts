import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ColorInfo {
  @ApiProperty({ description: '색상 값' })
  value: string;

  @ApiProperty({
    description: '색상 타입',
    enum: ['hex', 'css', 'tailwind', 'unknown'],
  })
  type: string;

  @ApiProperty({ description: '표시용 색상 값' })
  displayValue: string;

  @ApiProperty({
    description: 'CSS에서 사용할 수 있는 색상 값',
    required: false,
  })
  cssValue?: string;
}

export class DefectTypeResponseDto {
  @ApiProperty({ description: '불량 유형 ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '불량 유형 이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '불량 유형 설명', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ description: '색상 정보', type: ColorInfo, required: false })
  @Expose()
  @Transform(({ obj, value }) => {
    if (!obj.color) return null;
    // This will be populated by the service
    return value;
  })
  colorInfo?: ColorInfo;

  @ApiProperty({ description: '원본 색상 값 (하위 호환성)', required: false })
  @Expose()
  color?: string;

  @ApiProperty({ description: '생성일시' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @Expose()
  updatedAt: Date;
}
