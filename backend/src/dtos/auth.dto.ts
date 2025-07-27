import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '사용자명' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '사용자명' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '검사 유형', required: false, enum: ['incoming', 'process', 'shipment', 'all'] })
  @IsOptional()
  @IsString()
  @IsIn(['incoming', 'process', 'shipment', 'all'])
  inspectionType?: string;

  @ApiProperty({ description: '공정라인', required: false })
  @IsOptional()
  @IsString()
  processLine?: string;

  @ApiProperty({ description: '직급', required: false })
  @IsOptional()
  @IsString()
  rank?: string;

  @ApiProperty({ description: '직책', required: false })
  @IsOptional()
  @IsString()
  position?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ description: '이름', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: '검사 유형', required: false, enum: ['incoming', 'process', 'shipment', 'all'] })
  @IsOptional()
  @IsString()
  @IsIn(['incoming', 'process', 'shipment', 'all'])
  inspectionType?: string;

  @ApiProperty({ description: '공정라인', required: false })
  @IsOptional()
  @IsString()
  processLine?: string;

  @ApiProperty({ description: '직급', required: false })
  @IsOptional()
  @IsString()
  rank?: string;

  @ApiProperty({ description: '직책', required: false })
  @IsOptional()
  @IsString()
  position?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  access_token: string;

  @ApiProperty({ description: '리프레시 토큰' })
  refresh_token: string;

  @ApiProperty({ description: '사용자 정보' })
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    isActive: boolean;
    inspectionType?: string;
    processLine?: string;
    authType?: string;
    rank?: string;
    position?: string;
    lastLoginAt?: Date;
  };
}

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  inspectionType?: string;
  processLine?: string;
  iat?: number;
  exp?: number;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '리프레시 토큰' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}