import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import appConfig from '../../config/app.config';
import redisConfig from '../../redis/config/redis.config';
import databaseConfig from '../config/database.config';
import { TypeOrmConfigService } from '../typeorm-config.service';
import { AdminSeedModule } from './admin/admin-seed.module';
import { CmsPageSeedModule } from './cms-page/cms-page-seed.module';
import { LocationSeedModule } from './location/location-seed.module';
import { SettingSeedModule } from './setting/setting-seed.module';
import { TagSeedModule } from './tag/tag-seed.module';
import { UserSeedModule } from './user/user-seed.module';
import { WhiteLabelSeedModule } from './white-label/white-label-seed.module';

@Module({
  imports: [
    UserSeedModule,
    SettingSeedModule,
    WhiteLabelSeedModule,
    AdminSeedModule,
    CmsPageSeedModule,
    LocationSeedModule,
    TagSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
