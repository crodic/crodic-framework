import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotlightBannerEntity } from './entities/spotlight-banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpotlightBannerEntity])],
  exports: [TypeOrmModule],
})
export class SpotlightModule {}
