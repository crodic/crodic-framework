import { QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  FollowStatusResDto,
  FollowToggleResDto,
  FollowUserResDto,
} from '../dto/social-res.dto';
import { SocialService } from '../services/social.service';

@ApiTags('User Social Follow & Graph')
@Controller({ path: 'social', version: '1' })
@UseGuards(UserAuthGuard)
export class SocialUserController {
  constructor(private readonly socialService: SocialService) {}

  @Post('follow/:targetUserId')
  @ApiAuth({
    type: FollowToggleResDto,
    summary: 'Follow or unfollow a cosplayer or user',
    statusCode: HttpStatus.OK,
  })
  @ApiParam({ name: 'targetUserId', type: String })
  toggleFollow(
    @CurrentUser('id') followerId: AutoIncrementID,
    @Param('targetUserId') targetUserId: AutoIncrementID,
  ) {
    return this.socialService.toggleFollow(followerId, targetUserId);
  }

  @Get('following/:targetUserId/check')
  @ApiAuth({
    type: FollowStatusResDto,
    summary: 'Check if current user is following target user',
  })
  @ApiParam({ name: 'targetUserId', type: String })
  async checkIsFollowing(
    @CurrentUser('id') followerId: AutoIncrementID,
    @Param('targetUserId') targetUserId: AutoIncrementID,
  ): Promise<FollowStatusResDto> {
    const isFollowing = await this.socialService.checkIsFollowing(
      followerId,
      targetUserId,
    );
    return { isFollowing };
  }

  @Get('users/:userId/followers')
  @ApiAuth({
    type: FollowUserResDto,
    summary: 'Get paginated list of user followers',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['createdAt'],
      defaultSort: '-createdAt',
    },
  })
  @ApiParam({ name: 'userId', type: String })
  getFollowers(
    @Param('userId') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.socialService.getFollowers(userId, query);
  }

  @Get('users/:userId/following')
  @ApiAuth({
    type: FollowUserResDto,
    summary: 'Get paginated list of users followed by user',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['createdAt'],
      defaultSort: '-createdAt',
    },
  })
  @ApiParam({ name: 'userId', type: String })
  getFollowing(
    @Param('userId') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.socialService.getFollowing(userId, query);
  }
}
