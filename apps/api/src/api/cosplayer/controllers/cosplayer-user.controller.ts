import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateCosplayerCharacterReqDto,
  UpdateCosplayerCharacterReqDto,
  UpdateCosplayerProfileReqDto,
} from '../dto/cosplayer-req.dto';
import {
  CosplayerCharacterResDto,
  CosplayerDetailResDto,
} from '../dto/cosplayer-res.dto';
import { CosplayerService } from '../services/cosplayer.service';

@ApiTags('User Cosplayer Profile')
@Controller({ path: 'cosplayer', version: '1' })
@UseGuards(UserAuthGuard)
export class CosplayerUserController {
  constructor(private readonly cosplayerService: CosplayerService) {}

  @Get('me')
  @ApiAuth({
    type: CosplayerDetailResDto,
    summary: 'Get current user cosplayer profile with characters',
  })
  getMyProfile(@CurrentUser('id') userId: AutoIncrementID) {
    return this.cosplayerService.getMyProfile(userId);
  }

  @Patch('me')
  @ApiAuth({
    type: CosplayerDetailResDto,
    summary: 'Update current user cosplayer profile',
  })
  updateProfile(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: UpdateCosplayerProfileReqDto,
  ) {
    return this.cosplayerService.updateProfile(userId, dto);
  }

  // =================== CHARACTERS ===================

  @Get('me/characters')
  @ApiAuth({
    type: CosplayerCharacterResDto,
    summary: 'Get current user characters',
  })
  getMyCharacters(@CurrentUser('id') userId: AutoIncrementID) {
    return this.cosplayerService.getCharactersByUserId(userId);
  }

  @Post('me/characters')
  @ApiAuth({
    type: CosplayerCharacterResDto,
    summary: 'Add a new showcased cosplay character',
    statusCode: HttpStatus.CREATED,
  })
  addCharacter(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateCosplayerCharacterReqDto,
  ) {
    return this.cosplayerService.addCharacter(userId, dto);
  }

  @Patch('me/characters/:id')
  @ApiAuth({
    type: CosplayerCharacterResDto,
    summary: 'Update a showcased cosplay character',
  })
  @ApiParam({ name: 'id', type: String })
  updateCharacter(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') characterId: AutoIncrementID,
    @Body() dto: UpdateCosplayerCharacterReqDto,
  ) {
    return this.cosplayerService.updateCharacter(userId, characterId, dto);
  }

  @Delete('me/characters/:id')
  @ApiAuth({
    summary: 'Delete a showcased cosplay character',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async deleteCharacter(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') characterId: AutoIncrementID,
  ) {
    await this.cosplayerService.deleteCharacter(userId, characterId);
  }
}
