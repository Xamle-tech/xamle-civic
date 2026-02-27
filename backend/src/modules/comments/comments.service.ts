import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCommentDto } from '@xamle/types';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByPolicy(policyId: string, page: number | string = 1, limit: number | string = 20) {
    page = parseInt(String(page), 10);
    limit = Math.min(parseInt(String(limit), 10), 100);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { policyId, parentId: null, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, level: true } },
          children: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, name: true, avatarUrl: true, level: true } } },
          },
          _count: { select: { votes: true } },
        },
      }),
      this.prisma.comment.count({ where: { policyId, parentId: null, deletedAt: null } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateCommentDto, userId: string) {
    const policy = await this.prisma.policy.findUnique({ where: { id: dto.policyId } });
    if (!policy) throw new NotFoundException('Politique introuvable');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.policyId !== dto.policyId) {
        throw new NotFoundException('Commentaire parent introuvable');
      }
    }

    return this.prisma.comment.create({
      data: { ...dto, userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true, level: true } } },
    });
  }

  async softDelete(id: string, userId: string, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');

    const canDelete = comment.userId === userId || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(userRole);
    if (!canDelete) throw new ForbiddenException('Non autorisé');

    return this.prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async vote(targetId: string, userId: string, value: 1 | -1) {
    return this.prisma.vote.upsert({
      where: { userId_targetId_targetType: { userId, targetId, targetType: 'COMMENT' } },
      create: { userId, targetId, targetType: 'COMMENT', value },
      update: { value },
    });
  }
}
