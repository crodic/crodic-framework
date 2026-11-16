import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionItemEntity } from './entities/collection-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity, CollectionItemEntity])],
  exports: [TypeOrmModule],
})
export class CollectionModule {}
