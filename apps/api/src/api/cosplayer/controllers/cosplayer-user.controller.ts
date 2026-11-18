import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
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

  @Post('me/cover')
  @ApiAuth({
    summary: 'Upload current user profile cover image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|webp|jpeg|jpg)$/,
            skipMagicNumbersValidation: true,
            errorMessage: 'Invalid file type. Supported: PNG, WEBP, JPEG',
          }),
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            errorMessage: 'File too large (max 10MB)',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cosplayerService.uploadCover(userId, file);
  }

  @Post('me/avatar')
  @ApiAuth({
    summary: 'Upload current user profile avatar image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|webp|jpeg|jpg)$/,
            skipMagicNumbersValidation: true,
            errorMessage: 'Invalid file type. Supported: PNG, WEBP, JPEG',
          }),
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            errorMessage: 'File too large (max 5MB)',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cosplayerService.uploadAvatar(userId, file);
  }

  @Post('me/upload')
  @ApiAuth({
    summary: 'Upload general media (photosets, artwork, character covers)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|webp|jpeg|jpg|gif)$/,
            skipMagicNumbersValidation: true,
            errorMessage: 'Invalid file type. Supported: PNG, WEBP, JPEG, GIF',
          }),
          new MaxFileSizeValidator({
            maxSize: 15 * 1024 * 1024,
            errorMessage: 'File too large (max 15MB)',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    return this.cosplayerService.uploadMedia(userId, file, folder);
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
