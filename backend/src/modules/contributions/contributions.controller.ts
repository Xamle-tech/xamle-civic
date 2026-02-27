import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors,
  UploadedFile, SetMetadata, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateContributionDto } from '@xamle/types';
import { UserRole } from '@xamle/types';
import { ContributionStatus } from '@prisma/client';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('contributions')
@Controller('contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributionsController {
  constructor(private readonly svc: ContributionsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les contributions approuvées' })
  findAll(
    @Query('policyId') policyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll({ policyId, page, limit });
  }

  @Get('pending')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Contributions en attente de modération' })
  findPending(@Query('page') page?: number) {
    return this.svc.findAll({ status: ContributionStatus.PENDING, page });
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10_485_760 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Soumettre une contribution citoyenne' })
  create(
    @Body() dto: CreateContributionDto,
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.svc.create(dto, userId, file);
  }

  @Patch(':id/approve')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approuver une contribution' })
  approve(
    @Param('id') id: string,
    @Body('note') note: string,
    @CurrentUser('id') moderatorId: string,
  ) {
    return this.svc.moderate(id, moderatorId, 'APPROVE', note);
  }

  @Patch(':id/reject')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rejeter une contribution' })
  reject(
    @Param('id') id: string,
    @Body('note') note: string,
    @CurrentUser('id') moderatorId: string,
  ) {
    return this.svc.moderate(id, moderatorId, 'REJECT', note);
  }
}
