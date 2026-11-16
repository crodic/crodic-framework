import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from './entities/cosplayer-profile.entity';
import { CosplayerServiceEntity } from './entities/cosplayer-service.entity';
import { CosplayerCharacterEntity } from './entities/cosplayer-character.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CosplayerProfileEntity,
      CosplayerServiceEntity,
      CosplayerCharacterEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CosplayerModule {}
