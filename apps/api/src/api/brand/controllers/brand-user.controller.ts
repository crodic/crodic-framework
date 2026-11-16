import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateBrandReqDto, UpdateBrandReqDto } from '../dto/brand-req.dto';
import { BrandResDto } from '../dto/brand-res.dto';
import { BrandService } from '../services/brand.service';

@ApiTags('User Brand & Studio Management')
@Controller({ path: 'brands', version: '1' })
@UseGuards(UserAuthGuard)
export class BrandUserController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiAuth({
    type: BrandResDto,
    summary: 'Register a new brand or cosplay studio profile',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateBrandReqDto,
  ) {
    return this.brandService.create(userId, dto);
  }

  @Patch(':id')
  @ApiAuth({
    type: BrandResDto,
    summary: 'Update brand profile information',
  })
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') brandId: AutoIncrementID,
    @Body() dto: UpdateBrandReqDto,
  ) {
    return this.brandService.update(userId, brandId, dto);
  }
}
