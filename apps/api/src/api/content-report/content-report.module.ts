import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentReportEntity } from './entities/content-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentReportEntity])],
  exports: [TypeOrmModule],
})
export class ContentReportModule {}
