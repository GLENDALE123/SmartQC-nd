import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto } from '../dtos/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '@prisma/client';

@ApiTags('사용자 인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: '사용자 등록',
    description: '새로운 사용자를 등록합니다. 사용자명과 이메일은 고유해야 합니다.'
  })
  @ApiResponse({ 
    status: 201, 
    description: '사용자 등록이 성공적으로 완료되었습니다.', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: '사용자명 또는 이메일이 이미 존재합니다.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 데이터입니다.' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '사용자 로그인',
    description: '사용자명과 비밀번호를 사용하여 로그인합니다. 성공 시 JWT 토큰을 반환합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '로그인이 성공적으로 완료되었습니다.', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '잘못된 사용자명 또는 비밀번호입니다.' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    console.log('🔐 로그인 요청 받음:', { username: loginDto.username });
    try {
      const result = await this.authService.login(loginDto);
      console.log('✅ 로그인 성공:', { username: loginDto.username });
      return result;
    } catch (error) {
      console.log('❌ 로그인 실패:', { username: loginDto.username, error: error.message });
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '현재 사용자 정보 조회',
    description: 'JWT 토큰을 사용하여 현재 로그인한 사용자의 정보를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '사용자 정보를 성공적으로 조회했습니다.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '유효하지 않은 토큰입니다.' 
  })
  async getCurrentUser(@Request() req: { user: User }): Promise<User> {
    return req.user;
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '현재 사용자 정보 조회 (user endpoint)',
    description: 'JWT 토큰을 사용하여 현재 로그인한 사용자의 정보를 조회합니다. (me와 동일한 기능)'
  })
  @ApiResponse({ 
    status: 200, 
    description: '사용자 정보를 성공적으로 조회했습니다.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '유효하지 않은 토큰입니다.' 
  })
  async getUser(@Request() req: { user: User }): Promise<User> {
    return req.user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '토큰이 성공적으로 갱신되었습니다.', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '유효하지 않거나 만료된 리프레시 토큰입니다.' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '로그아웃',
    description: '현재 사용자를 로그아웃합니다. 클라이언트에서 토큰을 삭제해야 합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '성공적으로 로그아웃되었습니다.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '유효하지 않은 토큰입니다.' 
  })
  async logout(@Request() req: { user: User }): Promise<{ message: string }> {
    return this.authService.logout(req.user.id);
  }
}