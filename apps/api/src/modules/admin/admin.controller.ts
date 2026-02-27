import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@xamle/types';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Tableau de bord métriques administration' })
  getDashboardMetrics() {
    return this.svc.getDashboardMetrics();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Journal d\'audit complet (immuable)' })
  getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('actorId') actorId?: string,
    @Query('entity') entity?: string,
  ) {
    return this.svc.getAuditLogs(page, limit, actorId, entity);
  }
}
