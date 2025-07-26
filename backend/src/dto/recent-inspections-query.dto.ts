import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class RecentInspectionsQueryDto {
  @ApiProperty({ 
    description: '주문번호', 
    required: false,
    example: 'T00000-1'
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({ 
    description: '제품명', 
    required: false,
    example: '120ML원형'
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ 
    description: '부속명', 
    required: false,
    example: '본체'
  })
  @IsOptional()
  @IsString()
  partName?: string;

  @ApiProperty({ 
    description: '검사 유형', 
    required: false,
    enum: ['incoming', 'process', 'shipment'],
    example: 'incoming'
  })
  @IsOptional()
  @IsIn(['incoming', 'process', 'shipment'])
  type?: 'incoming' | 'process' | 'shipment';

  @ApiProperty({ 
    description: '조회할 개수 (기본값: 10, 최대: 50)', 
    required: false,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({ 
    description: '페이지 번호 (기본값: 1)', 
    required: false,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;
}