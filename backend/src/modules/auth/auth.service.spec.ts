import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret';
    if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
    if (key === 'JWT_EXPIRES_IN') return '15m';
    if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
    return null;
  }),
};

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: bcrypt.hashSync('password123', 10),
  role: 'CITIZEN',
  level: 'OBSERVER',
  isActive: true,
  isBlocked: false,
  phone: null,
  avatar: null,
  bio: null,
  consentGiven: true,
  consentAt: new Date(),
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', name: 'Test', password: 'pass', consent: true }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and returns tokens when email is new', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.register({
        email: 'new@example.com',
        name: 'New User',
        password: 'securepass',
        consent: true,
      });

      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens and sanitized user on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('refreshTokens', () => {
    it('throws UnauthorizedException when no stored token', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(
        service.refreshTokens('user-1', 'some-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token mismatch', async () => {
      mockRedis.get.mockResolvedValue('different-token');

      await expect(
        service.refreshTokens('user-1', 'my-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns new tokens when refresh token is valid', async () => {
      mockRedis.get.mockResolvedValue('valid-refresh-token');
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.refreshTokens('user-1', 'valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
