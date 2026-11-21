import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { CosplayerApplicationService } from '../cosplayer-application.service';
import { CreateCosplayerApplicationReqDto } from '../dto/create-cosplayer-application.req.dto';
import { CosplayerApplicationResDto } from '../dto/cosplayer-application.res.dto';

@ApiTags('Cosplayer Applications (User)')
@Controller({ path: 'cosplayer-applications', version: '1' })
@UseGuards(UserAuthGuard)
export class CosplayerApplicationController {
  constructor(
    private readonly applicationService: CosplayerApplicationService,
  ) {}

  @Post()
  @ApiAuth({
    type: CosplayerApplicationResDto,
    summary: 'Submit an application to become a verified cosplayer',
    statusCode: HttpStatus.CREATED,
  })
  submit(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateCosplayerApplicationReqDto,
  ): Promise<CosplayerApplicationResDto> {
    return this.applicationService.submit(userId, dto);
  }

  @Get('me')
  @ApiAuth({
    type: CosplayerApplicationResDto,
    summary: 'Get current user latest cosplayer application status',
  })
  getMyApplication(
    @CurrentUser('id') userId: AutoIncrementID,
  ): Promise<CosplayerApplicationResDto | null> {
    return this.applicationService.getMyApplication(userId);
  }
}
