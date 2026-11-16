import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandPublicController } from './controllers/brand-public.controller';
import { BrandUserController } from './controllers/brand-user.controller';
import { BrandMemberEntity } from './entities/brand-member.entity';
import { BrandEntity } from './entities/brand.entity';
import { BrandService } from './services/brand.service';

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity, BrandMemberEntity])],
  controllers: [BrandPublicController, BrandUserController],
  providers: [BrandService],
  exports: [TypeOrmModule, BrandService],
})
export class BrandModule {}
