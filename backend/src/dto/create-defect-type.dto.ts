import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidColor } from '../validators/color.validator';

export class CreateDefectTypeDto {
  @ApiProperty({
    description: '불량 유형 이름',
    example: '스크래치'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '불량 유형 설명',
    example: '표면에 생긴 긁힘',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '불량 유형 색상 (HEX 코드, CSS 색상명, 또는 Tailwind CSS 클래스)',
    examples: {
      hex: { value: '#FF0000', description: 'HEX 색상 코드' },
      css: { value: 'red', description: 'CSS 색상명' },
      tailwind: { value: 'bg-red-500', description: 'Tailwind CSS 클래스' }
    },
    required: false
  })
  @IsString()
  @IsOptional()
  @IsValidColor()
  color?: string;
} 