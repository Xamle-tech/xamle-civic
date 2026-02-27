import { Controller, Get, Query, UseGuards, SetMetadata, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@xamle/types';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Recherche full-text (Meilisearch)' })
  search(
    @Query('q') q: string,
    @Query('theme') theme?: string,
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: number,
  ) {
    return this.svc.search(q, { theme, status, region, limit });
  }

  @Post('reindex')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Réindexer toutes les politiques dans Meilisearch' })
  reindex() {
    return this.svc.reindexAll();
  }
}
