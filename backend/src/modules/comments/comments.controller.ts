import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, SetMetadata, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCommentDto } from '@xamle/types';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @Get('policy/:policyId')
  @Public()
  @ApiOperation({ summary: 'Commentaires threadés d\'une politique' })
  findByPolicy(
    @Param('policyId') policyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findByPolicy(policyId, page, limit);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Poster un commentaire' })
  create(@Body() dto: CreateCommentDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer (soft-delete) un commentaire' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.svc.softDelete(id, user.id, user.role);
  }

  @Post(':id/vote')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Voter pour un commentaire (+1/-1)' })
  vote(@Param('id') id: string, @Body('value') value: 1 | -1, @CurrentUser('id') userId: string) {
    return this.svc.vote(id, userId, value);
  }
}
