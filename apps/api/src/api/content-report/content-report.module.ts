import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentReportUserController } from './controllers/content-report-user.controller';
import { ContentReportEntity } from './entities/content-report.entity';
import { ContentReportService } from './services/content-report.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentReportEntity])],
  controllers: [ContentReportUserController],
  providers: [ContentReportService],
  exports: [TypeOrmModule, ContentReportService],
})
export class ContentReportModule {}
