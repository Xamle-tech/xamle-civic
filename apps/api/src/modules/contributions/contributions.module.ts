import { Module } from '@nestjs/common';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { MinioService } from './minio.service';

@Module({
  controllers: [ContributionsController],
  providers: [ContributionsService, MinioService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
