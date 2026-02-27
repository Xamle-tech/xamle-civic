import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { PrismaService } from '../../config/prisma.service';
import { MinioService } from './minio.service';
import { ContributionStatus } from '@prisma/client';
import { ContributionType } from '@xamle/types';

const mockPrisma = {
  contribution: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  policy: {
    findFirstOrThrow: jest.fn(),
  },
  user: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
  },
};

const mockMinio = {
  uploadFile: jest.fn(),
  validateMimeType: jest.fn().mockReturnValue(true),
};

const baseContribution = {
  id: 'contrib-1',
  type: ContributionType.TESTIMONY,
  content: 'J\'ai observé des travaux en cours dans ma commune.',
  policyId: 'policy-1',
  userId: 'user-1',
  status: ContributionStatus.PENDING,
  filePath: null,
  fileSize: null,
  mimeType: null,
  location: 'Dakar',
  reliabilityLevel: 'NOT_VERIFIED',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ContributionsService', () => {
  let service: ContributionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MinioService, useValue: mockMinio },
      ],
    }).compile();

    service = module.get<ContributionsService>(ContributionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated approved contributions by default', async () => {
      mockPrisma.contribution.findMany.mockResolvedValue([baseContribution]);
      mockPrisma.contribution.count.mockResolvedValue(1);

      const result = await service.findAll({ policyId: 'policy-1' });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ContributionStatus.APPROVED }),
        }),
      );
    });

    it('filters by status when provided', async () => {
      mockPrisma.contribution.findMany.mockResolvedValue([]);
      mockPrisma.contribution.count.mockResolvedValue(0);

      await service.findAll({ status: ContributionStatus.PENDING });

      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ContributionStatus.PENDING }),
        }),
      );
    });
  });

  describe('create', () => {
    const dto = {
      type: ContributionType.TESTIMONY,
      content: 'J\'ai vu les travaux démarrer dans mon quartier.',
      policyId: 'policy-1',
      location: 'Thiès',
    };

    it('throws NotFoundException when policy does not exist', async () => {
      mockPrisma.policy.findFirstOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.create(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when file is too large', async () => {
      mockPrisma.policy.findFirstOrThrow.mockResolvedValue({ id: 'policy-1' });

      const oversizedFile = {
        buffer: Buffer.alloc(11 * 1024 * 1024),
        originalname: 'big.pdf',
        mimetype: 'application/pdf',
        size: 11 * 1024 * 1024,
      } as Express.Multer.File;

      await expect(service.create(dto, 'user-1', oversizedFile)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when MIME type is invalid', async () => {
      mockPrisma.policy.findFirstOrThrow.mockResolvedValue({ id: 'policy-1' });
      mockMinio.validateMimeType.mockReturnValue(false);

      const badFile = {
        buffer: Buffer.alloc(100),
        originalname: 'script.exe',
        mimetype: 'application/x-msdownload',
        size: 100,
      } as Express.Multer.File;

      await expect(service.create(dto, 'user-1', badFile)).rejects.toThrow(BadRequestException);
    });

    it('creates contribution without file', async () => {
      mockPrisma.policy.findFirstOrThrow.mockResolvedValue({ id: 'policy-1' });
      mockPrisma.contribution.create.mockResolvedValue(baseContribution);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.create(dto, 'user-1');

      expect(result).toHaveProperty('id', 'contrib-1');
      expect(mockPrisma.contribution.create).toHaveBeenCalledTimes(1);
    });

    it('uploads file and stores path when file provided', async () => {
      mockPrisma.policy.findFirstOrThrow.mockResolvedValue({ id: 'policy-1' });
      mockMinio.validateMimeType.mockReturnValue(true);
      mockMinio.uploadFile.mockResolvedValue({ url: 'https://minio.test/contrib-1.pdf' });
      mockPrisma.contribution.create.mockResolvedValue({ ...baseContribution, filePath: 'https://minio.test/contrib-1.pdf' });
      mockPrisma.user.update.mockResolvedValue({});

      const file = {
        buffer: Buffer.alloc(500),
        originalname: 'proof.pdf',
        mimetype: 'application/pdf',
        size: 500,
      } as Express.Multer.File;

      const result = await service.create(dto, 'user-1', file);

      expect(mockMinio.uploadFile).toHaveBeenCalledTimes(1);
      expect(result.filePath).toBe('https://minio.test/contrib-1.pdf');
    });
  });

  describe('moderate', () => {
    it('throws NotFoundException for unknown contribution', async () => {
      mockPrisma.contribution.findUnique.mockResolvedValue(null);

      await expect(
        service.moderate('contrib-999', 'mod-1', 'APPROVE'),
      ).rejects.toThrow(NotFoundException);
    });

    it('approves pending contribution', async () => {
      mockPrisma.contribution.findUnique.mockResolvedValue(baseContribution);
      mockPrisma.contribution.update.mockResolvedValue({ ...baseContribution, status: ContributionStatus.APPROVED });
      mockPrisma.contribution.count.mockResolvedValue(3);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.moderate('contrib-1', 'mod-1', 'APPROVE');

      expect(result.status).toBe(ContributionStatus.APPROVED);
    });

    it('rejects pending contribution', async () => {
      mockPrisma.contribution.findUnique.mockResolvedValue(baseContribution);
      mockPrisma.contribution.update.mockResolvedValue({ ...baseContribution, status: ContributionStatus.REJECTED });

      const result = await service.moderate('contrib-1', 'mod-1', 'REJECT');

      expect(result.status).toBe(ContributionStatus.REJECTED);
    });
  });
});
