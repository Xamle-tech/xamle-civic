import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import type Redis from 'ioredis';
import { CreatePolicyDto, UpdatePolicyDto, PolicyFilterDto, ChangeStatusDto } from '@xamle/types';
import { PolicyStatus, WorkflowStatus } from '@prisma/client';
import slugify from 'slugify';

const CACHE_TTL = 300; // 5 minutes

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
    private config: ConfigService,
  ) {}

  async findAll(filter: PolicyFilterDto) {
    const page = parseInt(String(filter.page ?? 1), 10);
    const limit = Math.min(parseInt(String(filter.limit ?? 20), 10), 100);
    const { theme, status, ministryId, region, search, from, to } = filter;
    const skip = (page - 1) * limit;

    const where = {
      workflowStatus: WorkflowStatus.PUBLISHED,
      ...(theme && { theme }),
      ...(status && { status }),
      ...(ministryId && { ministryId }),
      ...(region && { region }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.policy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          ministry: { select: { id: true, name: true, slug: true, logo: true } },
          _count: { select: { contributions: true, comments: true, indicators: true } },
        },
      }),
      this.prisma.policy.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const cacheKey = `policy:${slug}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const policy = await this.prisma.policy.findUnique({
      where: { slug },
      include: {
        ministry: true,
        indicators: { orderBy: { measuredAt: 'desc' } },
        sources: { orderBy: { createdAt: 'desc' } },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
        _count: { select: { contributions: true, comments: true } },
      },
    });

    if (!policy) throw new NotFoundException(`Politique "${slug}" introuvable`);

    await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(policy));
    return policy;
  }

  async findById(id: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: { ministry: true, _count: { select: { contributions: true, comments: true } } },
    });
    if (!policy) throw new NotFoundException('Politique introuvable');
    return policy;
  }

  async create(dto: CreatePolicyDto, userId: string) {
    const slug = await this.generateUniqueSlug(dto.title);

    const policy = await this.prisma.policy.create({
      data: {
        ...dto,
        slug,
        budget: dto.budget ? dto.budget : undefined,
        budgetSpent: dto.budgetSpent ? dto.budgetSpent : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        targetKpis: dto.targetKpis as object[],
        createdBy: userId,
      },
    });

    await this.prisma.statusHistory.create({
      data: {
        policyId: policy.id,
        fromStatus: null,
        toStatus: policy.status,
        changedBy: userId,
        reason: 'Création initiale',
      },
    });

    await this.createVersion(policy.id, userId);
    this.logger.log(`Policy created: ${policy.slug} by ${userId}`);
    return policy;
  }

  async update(id: string, dto: UpdatePolicyDto, userId: string) {
    await this.findById(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.title) data.slug = await this.generateUniqueSlug(dto.title, id);
    if (dto.budget !== undefined) data.budget = dto.budget;
    if (dto.budgetSpent !== undefined) data.budgetSpent = dto.budgetSpent;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.targetKpis) data.targetKpis = dto.targetKpis as object[];

    const policy = await this.prisma.policy.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });

    await this.createVersion(id, userId);
    await this.invalidateCache(policy.slug);
    return policy;
  }

  async changeStatus(id: string, dto: ChangeStatusDto, userId: string) {
    const policy = await this.findById(id);

    if (policy.status === dto.status) {
      throw new BadRequestException('La politique est déjà dans ce statut');
    }

    const updated = await this.prisma.policy.update({
      where: { id },
      data: { status: dto.status as PolicyStatus },
    });

    await this.prisma.statusHistory.create({
      data: {
        policyId: id,
        fromStatus: policy.status as PolicyStatus,
        toStatus: dto.status as PolicyStatus,
        changedBy: userId,
        reason: dto.reason,
      },
    });

    await this.invalidateCache(updated.slug);
    this.logger.log(`Policy ${id} status changed: ${policy.status} → ${dto.status} by ${userId}`);
    return updated;
  }

  async publish(id: string, userId: string) {
    const policy = await this.findById(id);
    if (policy.workflowStatus === WorkflowStatus.PUBLISHED) {
      throw new BadRequestException('Déjà publiée');
    }

    const updated = await this.prisma.policy.update({
      where: { id },
      data: { workflowStatus: WorkflowStatus.PUBLISHED, publishedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'PUBLISH',
        entity: 'Policy',
        entityId: id,
        payload: { title: policy.title },
      },
    });

    await this.invalidateCache(updated.slug);
    return updated;
  }

  async globalStats() {
    const cacheKey = 'stats:global';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [statusCounts, budgetAgg, totals] = await Promise.all([
      this.prisma.policy.groupBy({
        by: ['status'],
        where: { workflowStatus: WorkflowStatus.PUBLISHED },
        _count: true,
      }),
      this.prisma.policy.aggregate({
        where: { workflowStatus: WorkflowStatus.PUBLISHED },
        _sum: { budget: true, budgetSpent: true },
      }),
      this.prisma.$transaction([
        this.prisma.policy.count({ where: { workflowStatus: WorkflowStatus.PUBLISHED } }),
        this.prisma.user.count(),
        this.prisma.contribution.count({ where: { status: 'APPROVED' } }),
      ]),
    ]);

    const [totalPolicies, totalUsers, totalContributions] = totals;

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
    const completed = byStatus[PolicyStatus.COMPLETED] ?? 0;

    const stats = {
      totalPolicies,
      completedPolicies: completed,
      inProgressPolicies: byStatus[PolicyStatus.IN_PROGRESS] ?? 0,
      delayedPolicies: byStatus[PolicyStatus.DELAYED] ?? 0,
      globalCompletionRate: totalPolicies > 0 ? Math.round((completed / totalPolicies) * 100) : 0,
      totalBudgetAllocated: budgetAgg._sum.budget ? Number(budgetAgg._sum.budget) : 0,
      totalBudgetSpent: budgetAgg._sum.budgetSpent ? Number(budgetAgg._sum.budgetSpent) : 0,
      totalUsers,
      totalContributions,
    };

    await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
    return stats;
  }

  private async createVersion(policyId: string, userId: string) {
    const policy = await this.prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) return;

    await this.prisma.policyVersion.upsert({
      where: { policyId_version: { policyId, version: policy.version } },
      create: { policyId, version: policy.version, snapshot: policy as object, changedBy: userId },
      update: { snapshot: policy as object },
    });
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true, locale: 'fr' });
    let slug = base;
    let i = 1;

    while (true) {
      const existing = await this.prisma.policy.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${base}-${i++}`;
    }

    return slug;
  }

  private async invalidateCache(slug: string) {
    await Promise.all([
      this.redis.del(`policy:${slug}`),
      this.redis.del('stats:global'),
    ]);
  }
}
