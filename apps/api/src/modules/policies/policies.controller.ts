import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePolicyDto, UpdatePolicyDto, PolicyFilterDto, ChangeStatusDto } from '@xamle/types';
import { UserRole } from '@xamle/types';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('policies')
@Controller('policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoliciesController {
  constructor(private readonly svc: PoliciesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les politiques publiques (filtrées)' })
  findAll(@Query() filter: PolicyFilterDto) {
    return this.svc.findAll(filter);
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Statistiques globales du tableau de bord' })
  globalStats() {
    return this.svc.globalStats();
  }

  @Get(':slugOrId')
  @Public()
  @ApiOperation({ summary: 'Détail d\'une politique par slug ou ID' })
  @ApiParam({ name: 'slugOrId', description: 'Slug ou UUID de la politique' })
  async findBySlugOrId(@Param('slugOrId') slugOrId: string) {
    // Check if it's a UUID (simple regex check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    
    if (isUuid) {
      return this.svc.findById(slugOrId);
    }
    return this.svc.findBySlug(slugOrId);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Créer une politique publique' })
  create(@Body() dto: CreatePolicyDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Modifier une politique' })
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto, @CurrentUser('id') userId: string) {
    return this.svc.update(id, dto, userId);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer le statut d\'une politique (audit trail immuable)' })
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.svc.changeStatus(id, dto, userId);
  }

  @Patch(':id/publish')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publier une politique' })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.publish(id, userId);
  }
}
