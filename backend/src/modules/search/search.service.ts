import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '../../config/prisma.service';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new MeiliSearch({
      host: config.get('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: config.get('MEILISEARCH_MASTER_KEY'),
    });
  }

  async onModuleInit() {
    try {
      await this.setupIndexes();
    } catch (e) {
      this.logger.warn('Meilisearch not available at startup — search will be degraded');
    }
  }

  private async setupIndexes() {
    const policiesIndex = this.client.index('policies');
    await policiesIndex.updateSettings({
      searchableAttributes: ['title', 'description', 'ministry.name'],
      filterableAttributes: ['theme', 'status', 'ministryId', 'region', 'workflowStatus'],
      sortableAttributes: ['updatedAt', 'title'],
      displayedAttributes: ['id', 'title', 'slug', 'description', 'theme', 'status', 'ministry', 'region', 'updatedAt'],
    });
    this.logger.log('Meilisearch indexes configured');
  }

  async indexPolicy(policy: Record<string, unknown>) {
    try {
      await this.client.index('policies').addDocuments([policy]);
    } catch (e) {
      this.logger.warn(`Failed to index policy ${policy.id}: ${e}`);
    }
  }

  async search(query: string, options?: { theme?: string; status?: string; region?: string; limit?: number }) {
    const { theme, status, region, limit = 20 } = options ?? {};
    const filters: string[] = ['workflowStatus = PUBLISHED'];
    if (theme) filters.push(`theme = ${theme}`);
    if (status) filters.push(`status = ${status}`);
    if (region) filters.push(`region = ${region}`);

    try {
      return await this.client.index('policies').search(query, {
        limit,
        filter: filters.join(' AND '),
        attributesToHighlight: ['title', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });
    } catch {
      // Fallback to Prisma if Meilisearch unavailable
      const data = await this.prisma.policy.findMany({
        where: {
          workflowStatus: WorkflowStatus.PUBLISHED,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: { ministry: { select: { name: true, slug: true } } },
      });
      return { hits: data, totalHits: data.length, query };
    }
  }

  async reindexAll() {
    const policies = await this.prisma.policy.findMany({
      where: { workflowStatus: WorkflowStatus.PUBLISHED },
      include: { ministry: { select: { id: true, name: true } } },
    });

    await this.client.index('policies').addDocuments(policies as Record<string, unknown>[]);
    this.logger.log(`Reindexed ${policies.length} policies`);
    return { indexed: policies.length };
  }
}
