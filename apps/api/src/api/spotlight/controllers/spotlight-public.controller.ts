import { ApiPublic } from '../../../decorators/http.decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SpotlightBannerResDto } from '../dto/spotlight-res.dto';
import { SpotlightService } from '../services/spotlight.service';

@ApiTags('Public Spotlight Banners')
@Controller({ path: 'public/spotlight', version: '1' })
export class SpotlightPublicController {
  constructor(private readonly spotlightService: SpotlightService) {}

  @Get()
  @ApiPublic({
    type: SpotlightBannerResDto,
    summary: 'Get active featured cosplayer spotlight banners for landing hero',
  })
  getSpotlightBanners(): Promise<SpotlightBannerResDto[]> {
    return this.spotlightService.getActiveBanners();
  }
}
