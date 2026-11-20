import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  BadRequestException,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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

  @Post('me/request-role')
  @ApiAuth({
    type: CosplayerDetailResDto,
    summary: 'Submit request to Admin to upgrade account role to Cosplayer',
    statusCode: HttpStatus.OK,
  })
  requestCosplayerRole(@CurrentUser('id') userId: AutoIncrementID) {
    return this.cosplayerService.requestCosplayerRole(userId);
  }

  @Post('me/cover')
  @ApiAuth({
    summary: 'Upload current user profile cover image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  async uploadCover(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    const file = files?.cover?.[0] || files?.file?.[0];
    if (!file) {
      throw new BadRequestException('Cover image file is required');
    }
    const allowed = /^image\/(png|webp|jpeg|jpg)$/;
    if (!allowed.test(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Supported: PNG, WEBP, JPEG',
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 10MB)');
    }
    return this.cosplayerService.uploadCover(userId, file);
  }

  @Post('me/avatar')
  @ApiAuth({
    summary: 'Upload current user profile avatar image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    const file = files?.avatar?.[0] || files?.file?.[0];
    if (!file) {
      throw new BadRequestException('Avatar image file is required');
    }
    const allowed = /^image\/(png|webp|jpeg|jpg)$/;
    if (!allowed.test(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Supported: PNG, WEBP, JPEG',
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 5MB)');
    }
    return this.cosplayerService.uploadAvatar(userId, file);
  }

  @Post('me/upload')
  @ApiAuth({
    summary: 'Upload general media (photosets, artwork, character covers)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'media', maxCount: 1 },
    ]),
  )
  async uploadMedia(
    @CurrentUser('id') userId: AutoIncrementID,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; media?: Express.Multer.File[] },
    @Body('folder') folder?: string,
  ) {
    const file = files?.file?.[0] || files?.media?.[0];
    if (!file) {
      throw new BadRequestException('Media file is required');
    }
    const allowedImage = /^image\/(png|webp|jpeg|jpg|gif)$/;
    const allowedVideo = /^video\/(mp4|webm|quicktime)$/;
    const isVideo = allowedVideo.test(file.mimetype);
    if (!allowedImage.test(file.mimetype) && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Supported images: PNG, WEBP, JPEG, GIF; videos: MP4, WEBM, MOV',
      );
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        isVideo ? 'Video too large (max 100MB)' : 'File too large (max 15MB)',
      );
    }
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
