import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from './entities/brand.entity';
import { BrandMemberEntity } from './entities/brand-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity, BrandMemberEntity])],
  exports: [TypeOrmModule],
})
export class BrandModule {}
