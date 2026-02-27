import { Controller, Get, Post, Put, Param, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MinistriesService } from './ministries.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@xamle/types';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('ministries')
@Controller('ministries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MinistriesController {
  constructor(private readonly svc: MinistriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister tous les ministères' })
  findAll() {
    return this.svc.findAll();
  }

  @Get('ranking')
  @Public()
  @ApiOperation({ summary: 'Classement des ministères par performance' })
  ranking() {
    return this.svc.performanceRanking();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Détail ministère + politiques associées' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Créer un ministère' })
  create(@Body() dto: { name: string; slug: string; logo?: string; description?: string; website?: string }) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Modifier un ministère' })
  update(@Param('id') id: string, @Body() dto: Partial<{ name: string; description: string; website: string }>) {
    return this.svc.update(id, dto);
  }
}
