import { Controller, Get, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@xamle/types';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.svc.getProfile(userId);
  }

  @Put('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Modifier son profil' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: { name?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.svc.updateProfile(userId, dto);
  }

  @Get('me/subscriptions')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mes abonnements à des politiques' })
  getSubscriptions(@CurrentUser('id') userId: string) {
    return this.svc.getSubscriptions(userId);
  }

  @Put('me/subscriptions/:policyId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'S\'abonner à une politique' })
  subscribe(
    @CurrentUser('id') userId: string,
    @Param('policyId') policyId: string,
    @Body('channels') channels: string[],
  ) {
    return this.svc.subscribe(userId, policyId, channels);
  }

  @Delete('me/subscriptions/:policyId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Se désabonner d\'une politique' })
  unsubscribe(@CurrentUser('id') userId: string, @Param('policyId') policyId: string) {
    return this.svc.unsubscribe(userId, policyId);
  }

  @Get('me/export')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export RGPD — mes données personnelles' })
  exportData(@CurrentUser('id') userId: string) {
    return this.svc.exportMyData(userId);
  }

  @Delete('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer mon compte (RGPD)' })
  deleteAccount(@CurrentUser('id') userId: string) {
    return this.svc.deleteMyAccount(userId);
  }

  // ─── Admin routes ─────────────────────────────────────────
  @Get()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Lister les utilisateurs' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.svc.findAll(page, limit);
  }

  @Patch(':id/role')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Modifier le rôle d\'un utilisateur' })
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.svc.updateRole(id, role);
  }

  @Patch(':id/toggle-active')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Activer/désactiver un compte' })
  toggleActive(@Param('id') id: string) {
    return this.svc.toggleActive(id);
  }
}
