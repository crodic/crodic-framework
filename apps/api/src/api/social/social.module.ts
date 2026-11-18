import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { SocialUserController } from './controllers/social-user.controller';
import { UserFollowEntity } from './entities/user-follow.entity';
import { SocialService } from './services/social.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFollowEntity, UserEntity])],
  controllers: [SocialUserController],
  providers: [SocialService],
  exports: [TypeOrmModule, SocialService],
})
export class SocialModule {}
