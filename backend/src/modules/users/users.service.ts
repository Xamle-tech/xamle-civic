import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, role: true, level: true,
        avatarUrl: true, bio: true, isVerified: true, createdAt: true,
        _count: { select: { contributions: true, comments: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateProfile(userId: string, dto: { name?: string; bio?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, bio: true, avatarUrl: true, updatedAt: true },
    });
  }

  async getSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { policy: { select: { id: true, title: true, slug: true, status: true, theme: true } } },
    });
  }

  async subscribe(userId: string, policyId: string, channels: string[]) {
    return this.prisma.subscription.upsert({
      where: { userId_policyId: { userId, policyId } },
      create: { userId, policyId, channels: channels as ('EMAIL' | 'SMS' | 'IN_APP')[] },
      update: { channels: channels as ('EMAIL' | 'SMS' | 'IN_APP')[] },
    });
  }

  async unsubscribe(userId: string, policyId: string) {
    return this.prisma.subscription.deleteMany({ where: { userId, policyId } });
  }

  async exportMyData(userId: string) {
    const [user, contributions, comments, subscriptions] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.contribution.findMany({ where: { userId } }),
      this.prisma.comment.findMany({ where: { userId } }),
      this.prisma.subscription.findMany({ where: { userId } }),
    ]);
    return { user, contributions, comments, subscriptions, exportedAt: new Date() };
  }

  async deleteMyAccount(userId: string) {
    await this.prisma.$transaction([
      this.prisma.subscription.deleteMany({ where: { userId } }),
      this.prisma.comment.updateMany({ where: { userId }, data: { deletedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false, email: `deleted_${userId}@xamle.sn`, phone: null, passwordHash: null },
      }),
    ]);
    return { message: 'Compte supprimé conformément au RGPD' };
  }

  // Admin only
  async findAll(page: number | string = 1, limit: number | string = 50) {
    page = parseInt(String(page), 10);
    limit = Math.min(parseInt(String(limit), 10), 100);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, level: true, isActive: true, createdAt: true, _count: { select: { contributions: true } } },
      }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateRole(targetId: string, role: string) {
    return this.prisma.user.update({ where: { id: targetId }, data: { role: role as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'EDITOR' | 'CONTRIBUTOR' | 'VISITOR' } });
  }

  async toggleActive(targetId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({ where: { id: targetId }, data: { isActive: !user.isActive } });
  }
}
