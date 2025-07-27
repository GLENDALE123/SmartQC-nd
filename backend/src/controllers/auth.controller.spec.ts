import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

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
    rank: '사원',
    position: '검사원',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    user: {
      id: 1,
      username: 'testuser',
      name: 'Test User',
      role: 'operator',
      isActive: true,
      inspectionType: 'incoming',
      processLine: 'line1',
      authType: 'local',
      lastLoginAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        inspectionType: 'incoming',
        processLine: 'line1',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user info', async () => {
      const req = { user: mockUser };

      const result = await controller.getCurrentUser(req);

      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto = {
        refresh_token: 'valid-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const req = { user: mockUser };
      const logoutResponse = {
        message: '성공적으로 로그아웃되었습니다. 클라이언트에서 토큰을 삭제해주세요.',
      };

      mockAuthService.logout.mockResolvedValue(logoutResponse);

      const result = await controller.logout(req);

      expect(mockAuthService.logout).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(logoutResponse);
    });
  });
});