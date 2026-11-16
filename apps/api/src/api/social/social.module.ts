import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowEntity } from './entities/user-follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFollowEntity])],
  exports: [TypeOrmModule],
})
export class SocialModule {}
