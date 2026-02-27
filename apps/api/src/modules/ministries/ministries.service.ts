import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import type Redis from 'ioredis';
import { WorkflowStatus, PolicyStatus } from '@prisma/client';

@Injectable()
export class MinistriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async findAll() {
    const cached = await this.redis.get('ministries:all');
    if (cached) return JSON.parse(cached);

    const ministries = await this.prisma.ministry.findMany({
      include: { _count: { select: { policies: true } } },
      orderBy: { name: 'asc' },
    });

    await this.redis.setex('ministries:all', 600, JSON.stringify(ministries));
    return ministries;
  }

  async findBySlug(slug: string) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { slug },
      include: {
        policies: {
          where: { workflowStatus: WorkflowStatus.PUBLISHED },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        _count: { select: { policies: true } },
      },
    });
    if (!ministry) throw new NotFoundException(`Ministère "${slug}" introuvable`);
    return ministry;
  }

  async performanceRanking() {
    const cacheKey = 'ministries:ranking';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const ministries = await this.prisma.ministry.findMany({
      include: { policies: { where: { workflowStatus: WorkflowStatus.PUBLISHED } } },
    });

    const ranking = ministries
      .map((m) => {
        const total = m.policies.length;
        const completed = m.policies.filter((p) => p.status === PolicyStatus.COMPLETED).length;
        const inProgress = m.policies.filter((p) => p.status === PolicyStatus.IN_PROGRESS).length;
        const delayed = m.policies.filter((p) => p.status === PolicyStatus.DELAYED).length;
        const totalBudget = m.policies.reduce((s, p) => s + (Number(p.budget) || 0), 0);
        const totalSpent = m.policies.reduce((s, p) => s + (Number(p.budgetSpent) || 0), 0);

        return {
          ministry: { id: m.id, name: m.name, slug: m.slug, logo: m.logo },
          totalPolicies: total,
          completedPolicies: completed,
          inProgressPolicies: inProgress,
          delayedPolicies: delayed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalBudget,
          budgetExecutionRate: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate);

    await this.redis.setex(cacheKey, 300, JSON.stringify(ranking));
    return ranking;
  }

  async create(dto: { name: string; slug: string; logo?: string; description?: string; website?: string }) {
    return this.prisma.ministry.create({ data: dto });
  }

  async update(id: string, dto: Partial<{ name: string; slug: string; logo: string; description: string; website: string }>) {
    const m = await this.prisma.ministry.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Ministère introuvable');
    await this.redis.del('ministries:all');
    await this.redis.del('ministries:ranking');
    return this.prisma.ministry.update({ where: { id }, data: dto });
  }
}
