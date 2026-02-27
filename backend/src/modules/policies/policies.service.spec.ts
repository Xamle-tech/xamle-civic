import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PrismaService } from '../../config/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import { ConfigService } from '@nestjs/config';
import { PolicyStatus } from '@xamle/types';

const mockPrisma = {
  policy: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
  statusHistory: { create: jest.fn() },
  policyVersion: { upsert: jest.fn() },
  auditLog: { create: jest.fn() },
  user: { count: jest.fn() },
  contribution: { count: jest.fn() },
  $transaction: jest.fn((arr: unknown[]) => Promise.all(arr)),
};

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
};

const mockConfig = { get: jest.fn((key: string, def?: unknown) => def) };

describe('PoliciesService', () => {
  let service: PoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
  });

  describe('findAll', () => {
    it('returns paginated policies', async () => {
      const policies = [{ id: '1', title: 'Policy A', slug: 'policy-a' }];
      mockPrisma.policy.findMany.mockResolvedValue(policies);
      mockPrisma.policy.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toEqual(policies);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findBySlug', () => {
    it('throws NotFoundException when policy not found', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns policy when found', async () => {
      const policy = { id: '1', slug: 'test-policy', title: 'Test' };
      mockPrisma.policy.findUnique.mockResolvedValue(policy);
      const result = await service.findBySlug('test-policy');
      expect(result).toEqual(policy);
    });
  });

  describe('changeStatus', () => {
    it('throws BadRequestException when status unchanged', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue({
        id: '1', status: PolicyStatus.IN_PROGRESS, slug: 'test',
        ministry: null, _count: { contributions: 0, comments: 0 },
      });
      await expect(
        service.changeStatus('1', { status: PolicyStatus.IN_PROGRESS }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates status history on valid transition', async () => {
      const policy = { id: '1', status: PolicyStatus.IN_PROGRESS, slug: 'test', ministry: null, _count: { contributions: 0, comments: 0 } };
      mockPrisma.policy.findUnique.mockResolvedValue(policy);
      mockPrisma.policy.update.mockResolvedValue({ ...policy, status: PolicyStatus.COMPLETED });
      mockPrisma.statusHistory.create.mockResolvedValue({});

      await service.changeStatus('1', { status: PolicyStatus.COMPLETED, reason: 'Achevé' }, 'user1');
      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromStatus: PolicyStatus.IN_PROGRESS,
            toStatus: PolicyStatus.COMPLETED,
          }),
        }),
      );
    });
  });
});
