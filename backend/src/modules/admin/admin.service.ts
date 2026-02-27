import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(page = 1, limit = 50, actorId?: string, entity?: string) {
    const skip = (page - 1) * limit;
    const where = {
      ...(actorId && { actorId }),
      ...(entity && { entity }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getDashboardMetrics() {
    const [
      users,
      policies,
      contributions,
      pendingContributions,
      comments,
      recentLogs,
    ] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.policy.groupBy({ by: ['status'], _count: true }),
      this.prisma.contribution.count(),
      this.prisma.contribution.count({ where: { status: 'PENDING' } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { name: true, email: true } } },
      }),
    ]);

    return {
      users: { byRole: Object.fromEntries(users.map((u) => [u.role, u._count])) },
      policies: { byStatus: Object.fromEntries(policies.map((p) => [p.status, p._count])) },
      contributions: { total: contributions, pending: pendingContributions },
      comments: { total: comments },
      recentActivity: recentLogs,
    };
  }
}
