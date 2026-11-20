import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth } from '../../../decorators/http.decorators';
import { CheckPolicies } from '../../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { AppAbility } from '../../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../../utils/permissions.constant';
import {
  RankingSettingsDto,
  TriggerSnapshotResDto,
  UpdateRankingSettingsReqDto,
} from '../dto/ranking-settings.dto';
import { LeaderboardItemResDto } from '../dto/ranking-res.dto';
import { RankingService } from '../services/ranking.service';

@ApiTags('Admin Ranking & Leaderboard Management')
@Controller({ path: 'admin/rankings', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class RankingAdminController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('settings')
  @ApiAuth({
    type: RankingSettingsDto,
    summary: 'Get ranking formula weights and cron automation settings',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Ranking),
  )
  async getSettings(): Promise<RankingSettingsDto> {
    return this.rankingService.getSettings();
  }

  @Put('settings')
  @ApiAuth({
    type: RankingSettingsDto,
    summary: 'Update ranking formula weights and cron automation options',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Ranking),
  )
  async updateSettings(
    @Body() dto: UpdateRankingSettingsReqDto,
  ): Promise<RankingSettingsDto> {
    return this.rankingService.updateSettings(dto);
  }

  @Post('recalculate')
  @ApiAuth({
    type: TriggerSnapshotResDto,
    summary: 'Manually trigger ranking recalculation and take new snapshots',
  })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(AppActions.Update, AppSubjects.Ranking) ||
      ability.can(AppActions.Manage, AppSubjects.Ranking),
  )
  async triggerRecalculate(): Promise<TriggerSnapshotResDto> {
    return this.rankingService.triggerSnapshotRecalculate();
  }

  @Get('preview')
  @ApiAuth({
    type: LeaderboardItemResDto,
    isPaginated: false,
    summary: 'Get top 10 live preview of rankings with current weights',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Ranking),
  )
  async getPreview(): Promise<LeaderboardItemResDto[]> {
    return this.rankingService.getPreviewRanking();
  }
}
