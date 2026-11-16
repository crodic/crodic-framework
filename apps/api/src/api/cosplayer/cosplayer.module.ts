import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CosplayerPublicController } from './controllers/cosplayer-public.controller';
import { CosplayerUserController } from './controllers/cosplayer-user.controller';
import { CosplayerCharacterEntity } from './entities/cosplayer-character.entity';
import { CosplayerProfileEntity } from './entities/cosplayer-profile.entity';
import { CosplayerServiceEntity } from './entities/cosplayer-service.entity';
import { CosplayerService } from './services/cosplayer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CosplayerProfileEntity,
      CosplayerServiceEntity,
      CosplayerCharacterEntity,
      UserEntity,
    ]),
  ],
  controllers: [CosplayerPublicController, CosplayerUserController],
  providers: [CosplayerService],
  exports: [TypeOrmModule, CosplayerService],
})
export class CosplayerModule {}
