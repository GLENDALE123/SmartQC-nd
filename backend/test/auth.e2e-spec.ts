import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'test_',
        },
      },
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First, create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: 'test_refresh_user',
          password: hashedPassword,
          name: 'Test Refresh User',
          role: UserRole.operator,
          isActive: true,
          inspectionType: 'incoming',
          processLine: 'line1',
          authType: 'local',
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test_refresh_user',
          password: 'password123',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.access_token).toBeDefined();
      expect(loginResponse.body.data.refresh_token).toBeDefined();

      const { refresh_token } = loginResponse.body.data;

      // Add a small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test refresh endpoint
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token,
        })
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data.access_token).toBeDefined();
      expect(refreshResponse.body.data.refresh_token).toBeDefined();
      expect(refreshResponse.body.data.user).toBeDefined();
      expect(refreshResponse.body.data.user.id).toBe(user.id);
      expect(refreshResponse.body.data.user.username).toBe('test_refresh_user');
      expect(refreshResponse.body.data.user.inspectionType).toBe('incoming');
      expect(refreshResponse.body.data.user.processLine).toBe('line1');

      // Verify new tokens are different from original
      expect(refreshResponse.body.data.access_token).not.toBe(
        loginResponse.body.data.access_token,
      );
      expect(refreshResponse.body.data.refresh_token).not.toBe(
        loginResponse.body.data.refresh_token,
      );
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: 'invalid_token',
        })
        .expect(401);

      expect(response.body.message).toContain(
        '유효하지 않거나 만료된 리프레시 토큰입니다',
      );
    });

    it('should return 401 for access token used as refresh token', async () => {
      // Create a test user and login
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          username: 'test_wrong_token_user',
          password: hashedPassword,
          name: 'Test Wrong Token User',
          role: UserRole.operator,
          isActive: true,
          inspectionType: 'all',
          authType: 'local',
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test_wrong_token_user',
          password: 'password123',
        })
        .expect(200);

      // Try to use access token as refresh token
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: loginResponse.body.data.access_token, // Wrong token type
        })
        .expect(401);

      expect(response.body.message).toContain(
        '유효하지 않은 리프레시 토큰입니다',
      );
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user with valid token', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          username: 'test_logout_user',
          password: hashedPassword,
          name: 'Test Logout User',
          role: UserRole.operator,
          isActive: true,
          inspectionType: 'process',
          processLine: 'line2',
          authType: 'local',
        },
      });

      // Login to get access token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test_logout_user',
          password: 'password123',
        })
        .expect(200);

      const { access_token } = loginResponse.body.data;

      // Test logout endpoint
      const logoutResponse = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.data.message).toContain(
        '성공적으로 로그아웃되었습니다',
      );
      expect(logoutResponse.body.data.message).toContain(
        '클라이언트에서 토큰을 삭제해주세요',
      );
    });

    it('should return 401 for logout without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('should return 401 for logout with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('Token expiration handling', () => {
    it('should handle token expiration gracefully', async () => {
      // This test would require mocking time or using very short token expiration
      // For now, we'll test the error handling path
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid', // Expired token
        })
        .expect(401);

      expect(response.body.message).toContain(
        '유효하지 않거나 만료된 리프레시 토큰입니다',
      );
    });
  });
});
