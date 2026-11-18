import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../post/entities/post.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CollectionUserController } from './controllers/collection-user.controller';
import { CollectionItemEntity } from './entities/collection-item.entity';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionService } from './services/collection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionEntity,
      CollectionItemEntity,
      PostEntity,
      UserEntity,
    ]),
  ],
  controllers: [CollectionUserController],
  providers: [CollectionService],
  exports: [TypeOrmModule, CollectionService],
})
export class CollectionModule {}
