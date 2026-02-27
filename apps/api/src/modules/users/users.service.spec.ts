import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/prisma.service';

const mockUser = {
  id: 'user-1',
  email: 'citizen@example.com',
  name: 'Aminata Diallo',
  phone: null,
  role: 'CITIZEN',
  level: 'OBSERVER',
  isActive: true,
  isBlocked: false,
  avatarUrl: null,
  bio: null,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { contributions: 3, comments: 7 },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  subscription: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  contribution: { findMany: jest.fn() },
  comment: { findMany: jest.fn(), updateMany: jest.fn() },
  $transaction: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns sanitized user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('updates user bio and name', async () => {
      const updated = { id: 'user-1', name: 'Updated Name', bio: 'New bio', avatarUrl: null, updatedAt: new Date() };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('user-1', { name: 'Updated Name', bio: 'New bio' });

      expect(result.name).toBe('Updated Name');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });
  });

  describe('getSubscriptions', () => {
    it('returns all subscriptions for a user', async () => {
      const subs = [
        { id: 'sub-1', userId: 'user-1', policyId: 'pol-1', channels: ['EMAIL'], policy: { id: 'pol-1', title: 'Test', slug: 'test', status: 'IN_PROGRESS', theme: 'Santé' } },
      ];
      mockPrisma.subscription.findMany.mockResolvedValue(subs);

      const result = await service.getSubscriptions('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].policy.title).toBe('Test');
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('upserts subscription', async () => {
      const sub = { id: 'sub-1', userId: 'user-1', policyId: 'pol-1', channels: ['EMAIL', 'IN_APP'] };
      mockPrisma.subscription.upsert.mockResolvedValue(sub);

      const result = await service.subscribe('user-1', 'pol-1', ['EMAIL', 'IN_APP']);

      expect(result.channels).toContain('EMAIL');
      expect(mockPrisma.subscription.upsert).toHaveBeenCalledTimes(1);
    });

    it('removes subscription on unsubscribe', async () => {
      mockPrisma.subscription.deleteMany.mockResolvedValue({ count: 1 });

      await service.unsubscribe('user-1', 'pol-1');

      expect(mockPrisma.subscription.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', policyId: 'pol-1' },
      });
    });
  });

  describe('exportMyData', () => {
    it('returns all user data for GDPR export', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.contribution.findMany.mockResolvedValue([]);
      mockPrisma.comment.findMany.mockResolvedValue([]);
      mockPrisma.subscription.findMany.mockResolvedValue([]);

      const result = await service.exportMyData('user-1');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('contributions');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('subscriptions');
      expect(result).toHaveProperty('exportedAt');
    });
  });

  describe('deleteMyAccount', () => {
    it('soft-deletes user account', async () => {
      mockPrisma.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));
      mockPrisma.subscription.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.comment.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.deleteMyAccount('user-1');

      expect(result.message).toContain('RGPD');
    });
  });

  describe('toggleActive', () => {
    it('throws NotFoundException for unknown user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('ghost-id')).rejects.toThrow(NotFoundException);
    });

    it('deactivates active user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await service.toggleActive('user-1');

      expect(result.isActive).toBe(false);
    });
  });
});
