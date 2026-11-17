import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotlightAdminController } from './controllers/spotlight-admin.controller';
import { SpotlightPublicController } from './controllers/spotlight-public.controller';
import { SpotlightBannerEntity } from './entities/spotlight-banner.entity';
import { SpotlightService } from './services/spotlight.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpotlightBannerEntity])],
  controllers: [SpotlightAdminController, SpotlightPublicController],
  providers: [SpotlightService],
  exports: [TypeOrmModule, SpotlightService],
})
export class SpotlightModule {}
