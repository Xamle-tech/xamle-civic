import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MinioService } from './minio.service';
import { CreateContributionDto } from '@xamle/types';
import { ContributionStatus } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class ContributionsService {
  private readonly logger = new Logger(ContributionsService.name);

  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async findAll(filter: { policyId?: string; status?: ContributionStatus; page?: number; limit?: number }) {
    const { policyId, status } = filter;
    const page = parseInt(String(filter.page ?? 1), 10);
    const limit = Math.min(parseInt(String(filter.limit ?? 20), 10), 100);
    const skip = (page - 1) * limit;
    const where = {
      ...(policyId && { policyId }),
      ...(status ? { status } : { status: ContributionStatus.APPROVED }),
    };

    const [data, total] = await Promise.all([
      this.prisma.contribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, level: true } },
          policy: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateContributionDto, userId: string, file?: Express.Multer.File) {
    await this.prisma.policy.findFirstOrThrow({ where: { id: dto.policyId } }).catch(() => {
      throw new NotFoundException('Politique introuvable');
    });

    let filePath: string | undefined;
    let fileSize: number | undefined;
    let mimeType: string | undefined;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException('Fichier trop volumineux (max 10 Mo)');
      }
      if (!this.minio.validateMimeType(file.mimetype)) {
        throw new BadRequestException('Type de fichier non autorisé (PDF, JPG, PNG, WEBP uniquement)');
      }
      const uploaded = await this.minio.uploadFile(file.buffer, file.originalname, file.mimetype);
      filePath = uploaded.url;
      fileSize = file.size;
      mimeType = file.mimetype;
    }

    const contribution = await this.prisma.contribution.create({
      data: {
        ...dto,
        userId,
        filePath,
        fileSize,
        mimeType,
      },
    });

    this.logger.log(`Contribution created: ${contribution.id} by ${userId}`);
    return contribution;
  }

  async moderate(id: string, moderatorId: string, decision: 'APPROVE' | 'REJECT', note?: string) {
    const contribution = await this.prisma.contribution.findUnique({ where: { id } });
    if (!contribution) throw new NotFoundException('Contribution introuvable');
    if (contribution.status !== ContributionStatus.PENDING) {
      throw new BadRequestException('Contribution déjà modérée');
    }

    const updated = await this.prisma.contribution.update({
      where: { id },
      data: {
        status: decision === 'APPROVE' ? ContributionStatus.APPROVED : ContributionStatus.REJECTED,
        moderatorId,
        moderatorNote: note,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: moderatorId,
        action: decision === 'APPROVE' ? 'APPROVE_CONTRIBUTION' : 'REJECT_CONTRIBUTION',
        entity: 'Contribution',
        entityId: id,
        payload: { note },
      },
    });

    if (decision === 'APPROVE') {
      await this.updateUserLevel(contribution.userId);
    }

    return updated;
  }

  private async updateUserLevel(userId: string) {
    const count = await this.prisma.contribution.count({
      where: { userId, status: ContributionStatus.APPROVED },
    });

    let level: 'OBSERVER' | 'CONTRIBUTOR' | 'EXPERT' | 'AMBASSADOR' = 'OBSERVER';
    if (count >= 50) level = 'AMBASSADOR';
    else if (count >= 20) level = 'EXPERT';
    else if (count >= 5) level = 'CONTRIBUTOR';

    await this.prisma.user.update({ where: { id: userId }, data: { level } });
  }
}
