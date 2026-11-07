import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from '../../config/app.config';
import redisConfig from '../../redis/config/redis.config';
import databaseConfig from '../config/database.config';
import { TypeOrmConfigService } from '../typeorm-config.service';
import { TagSeedModule } from './tag/tag-seed.module';
import { TagSeedService } from './tag/tag-seed.service';

@Module({
  imports: [
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
class StandaloneTagSeedModule {}

async function runTagSeed() {
  const app = await NestFactory.createApplicationContext(
    StandaloneTagSeedModule,
  );
  try {
    await app.get(TagSeedService).run();
  } finally {
    await app.close();
  }
}

void runTagSeed();
