import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { User, UserRole } from '@prisma/client';
import { LoginDto, RegisterDto, AuthResponseDto, JwtPayload, RefreshTokenDto, UpdateProfileDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, password, name, inspectionType, processLine } = registerDto;

    // 사용자명 중복 확인
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('이미 사용 중인 사용자명입니다.');
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성 - lastLoginAt을 현재 시간으로 설정
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: UserRole.operator, // 기본 역할
        isActive: true,
        inspectionType: inspectionType || 'all', // 기본값: 모든 검사 권한
        processLine: processLine || null,
        authType: 'local', // 기본 인증 타입
        lastLoginAt: new Date(), // 등록 시점을 첫 로그인으로 간주
      },
    });

    // JWT 토큰 생성 - inspectionType, processLine 정보 포함
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      inspectionType: user.inspectionType,
      processLine: user.processLine,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role.toString(),
        isActive: user.isActive,
        inspectionType: user.inspectionType,
        processLine: user.processLine,
        authType: user.authType,
        rank: user.rank,
        position: user.position,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // 사용자 찾기 (아이디로만)
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('잘못된 사용자명 또는 비밀번호입니다.');
    }

    // 사용자 활성 상태 확인
    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 사용자입니다.');
    }

    // 비밀번호 확인 - bcrypt 사용
    if (!user.password) {
      throw new UnauthorizedException('사용자 비밀번호 정보가 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 사용자명 또는 비밀번호입니다.');
    }

    // lastLoginAt 필드 업데이트
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT 토큰 생성 - inspectionType, processLine 정보 포함
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      inspectionType: user.inspectionType,
      processLine: user.processLine,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role.toString(),
        isActive: updatedUser.isActive,
        inspectionType: updatedUser.inspectionType,
        processLine: updatedUser.processLine,
        authType: updatedUser.authType,
        rank: updatedUser.rank,
        position: updatedUser.position,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 사용자입니다.');
    }
    return user;
  }

  /**
   * 사용자별 검사 권한 관리 로직
   * @param userId 사용자 ID
   * @param inspectionType 검사 유형 ('incoming', 'process', 'shipment')
   * @returns 권한 여부
   */
  async hasInspectionPermission(userId: number, inspectionType: string): Promise<boolean> {
    const user = await this.validateUser(userId);
    
    // 관리자는 모든 검사 권한 보유
    if (user.role === UserRole.admin || user.role === UserRole.manager) {
      return true;
    }
    
    // 사용자의 inspectionType이 'all'이면 모든 검사 권한 보유
    if (user.inspectionType === 'all') {
      return true;
    }
    
    // 사용자의 inspectionType과 요청된 검사 유형이 일치하는지 확인
    return user.inspectionType === inspectionType;
  }

  /**
   * 사용자별 공정라인 권한 확인
   * @param userId 사용자 ID
   * @param processLine 공정라인
   * @returns 권한 여부
   */
  async hasProcessLinePermission(userId: number, processLine?: string): Promise<boolean> {
    if (!processLine) {
      return true; // 공정라인이 지정되지 않은 경우 허용
    }

    const user = await this.validateUser(userId);
    
    // 관리자는 모든 공정라인 권한 보유
    if (user.role === UserRole.admin || user.role === UserRole.manager) {
      return true;
    }
    
    // 사용자의 공정라인이 지정되지 않은 경우 모든 라인 접근 가능
    if (!user.processLine) {
      return true;
    }
    
    // 사용자의 공정라인과 요청된 공정라인이 일치하는지 확인
    return user.processLine === processLine;
  }

  /**
   * JWT 토큰에서 사용자 정보 추출
   * @param token JWT 토큰
   * @returns 사용자 정보
   */
  async getUserFromToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        userId: payload.sub,
        username: payload.username,
        role: payload.role,
        inspectionType: payload.inspectionType,
        processLine: payload.processLine,
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
   * @param refreshTokenDto 리프레시 토큰 DTO
   * @returns 새로운 토큰 정보
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refresh_token } = refreshTokenDto;

    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify(refresh_token);
      
      // 리프레시 토큰 타입 확인
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 사용자 정보 조회 및 검증
      const user = await this.validateUser(payload.sub);

      // 새로운 액세스 토큰 및 리프레시 토큰 생성
      const newPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        inspectionType: user.inspectionType,
        processLine: user.processLine,
      };
      
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '7d' }
      );

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role.toString(),
          isActive: user.isActive,
          inspectionType: user.inspectionType,
          processLine: user.processLine,
          authType: user.authType,
          lastLoginAt: user.lastLoginAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다.');
    }
  }

  /**
   * 프로필 업데이트
   * @param userId 사용자 ID
   * @param updateProfileDto 업데이트할 프로필 정보
   * @returns 업데이트된 사용자 정보
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    // 사용자 검증
    await this.validateUser(userId);

    // 프로필 업데이트
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.name && { name: updateProfileDto.name }),
        ...(updateProfileDto.inspectionType && { inspectionType: updateProfileDto.inspectionType }),
        ...(updateProfileDto.processLine !== undefined && { processLine: updateProfileDto.processLine }),
        ...(updateProfileDto.rank !== undefined && { rank: updateProfileDto.rank }),
        ...(updateProfileDto.position !== undefined && { position: updateProfileDto.position }),
        updatedAt: new Date(),
      },
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      role: updatedUser.role.toString(),
      isActive: updatedUser.isActive,
      inspectionType: updatedUser.inspectionType,
      processLine: updatedUser.processLine,
      authType: updatedUser.authType,
      rank: updatedUser.rank,
      position: updatedUser.position,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * 로그아웃 처리
   * 현재는 stateless JWT를 사용하므로 클라이언트에서 토큰을 삭제하도록 안내
   * 향후 토큰 블랙리스트 기능을 추가할 수 있음
   * @param userId 사용자 ID
   * @returns 로그아웃 성공 메시지
   */
  async logout(userId: number): Promise<{ message: string }> {
    // 사용자 검증
    await this.validateUser(userId);

    // 현재는 stateless JWT를 사용하므로 서버에서 특별한 처리 없음
    // 향후 필요시 토큰 블랙리스트나 데이터베이스에 로그아웃 기록 저장 가능
    
    return {
      message: '성공적으로 로그아웃되었습니다. 클라이언트에서 토큰을 삭제해주세요.',
    };
  }
}