import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    name: 'Test User',
    role: UserRole.operator,
    isActive: true,
    inspectionType: 'incoming',
    processLine: 'line1',
    authType: 'local',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user and update lastLoginAt', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithHashedPassword);
      mockPrismaService.user.update.mockResolvedValue({
        ...userWithHashedPassword,
        lastLoginAt: new Date(),
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: 1,
        username: 'testuser',
        role: UserRole.operator,
        inspectionType: 'incoming',
        processLine: 'line1',
      }, { expiresIn: '15m' });
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(2, {
        sub: 1,
        type: 'refresh',
      }, { expiresIn: '7d' });
      expect(result.access_token).toBe('jwt-token');
      expect(result.refresh_token).toBe('jwt-token');
      expect(result.user.inspectionType).toBe('incoming');
      expect(result.user.processLine).toBe('line1');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const inactiveUser = { ...mockUser, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('hasInspectionPermission', () => {
    it('should return true for admin users', async () => {
      const adminUser = { ...mockUser, role: UserRole.admin };
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      const result = await service.hasInspectionPermission(1, 'incoming');

      expect(result).toBe(true);
    });

    it('should return true for users with "all" inspection type', async () => {
      const userWithAllPermissions = { ...mockUser, inspectionType: 'all' };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithAllPermissions);

      const result = await service.hasInspectionPermission(1, 'incoming');

      expect(result).toBe(true);
    });

    it('should return true for matching inspection type', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.hasInspectionPermission(1, 'incoming');

      expect(result).toBe(true);
    });

    it('should return false for non-matching inspection type', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.hasInspectionPermission(1, 'process');

      expect(result).toBe(false);
    });
  });

  describe('hasProcessLinePermission', () => {
    it('should return true for admin users', async () => {
      const adminUser = { ...mockUser, role: UserRole.admin };
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      const result = await service.hasProcessLinePermission(1, 'line2');

      expect(result).toBe(true);
    });

    it('should return true when no process line is specified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.hasProcessLinePermission(1);

      expect(result).toBe(true);
    });

    it('should return true for matching process line', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.hasProcessLinePermission(1, 'line1');

      expect(result).toBe(true);
    });

    it('should return false for non-matching process line', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.hasProcessLinePermission(1, 'line2');

      expect(result).toBe(false);
    });
  });

  describe('getUserFromToken', () => {
    it('should extract user info from valid token', async () => {
      const payload = {
        sub: 1,
        username: 'testuser',
        role: UserRole.operator,
        inspectionType: 'incoming',
        processLine: 'line1',
      };
      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.getUserFromToken('valid-token');

      expect(result).toEqual({
        userId: 1,
        username: 'testuser',
        role: UserRole.operator,
        inspectionType: 'incoming',
        processLine: 'line1',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.getUserFromToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'valid-refresh-token' };
      const refreshPayload = { sub: 1, type: 'refresh' };
      
      mockJwtService.verify.mockReturnValue(refreshPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');
      expect(result.user.id).toBe(1);
    });

    it('should throw UnauthorizedException for invalid refresh token type', async () => {
      const refreshTokenDto = { refresh_token: 'invalid-type-token' };
      const invalidPayload = { sub: 1, type: 'access' }; // Wrong type
      
      mockJwtService.verify.mockReturnValue(invalidPayload);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'expired-token' };
      
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout valid user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.logout(1);

      expect(result.message).toContain('성공적으로 로그아웃되었습니다');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.logout(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});