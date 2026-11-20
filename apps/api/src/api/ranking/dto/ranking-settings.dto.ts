import {
  BooleanField,
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class RankingSettingsDto {
  @NumberField({ min: 0, max: 100, default: 2 })
  likesWeight!: number;

  @NumberField({ min: 0, max: 100, default: 5 })
  followersWeight!: number;

  @BooleanField({ default: true })
  enableCronJob!: boolean;

  @BooleanField({ default: true })
  enableFallbackRealtime!: boolean;

  @StringFieldOptional({ default: '0 0 * * 1' })
  cronSchedule?: string;

  @StringFieldOptional()
  lastSnapshotAt?: string | null;

  @StringFieldOptional({ default: 'idle' })
  lastSnapshotStatus?: 'idle' | 'success' | 'failed';
}

export class UpdateRankingSettingsReqDto {
  @NumberField({ min: 0, max: 100, default: 2 })
  likesWeight!: number;

  @NumberField({ min: 0, max: 100, default: 5 })
  followersWeight!: number;

  @BooleanField({ default: true })
  enableCronJob!: boolean;

  @BooleanField({ default: true })
  enableFallbackRealtime!: boolean;
}

export class TriggerSnapshotResDto {
  message!: string;
  processedCategories!: string[];
  timestamp!: string;
}

export const DEFAULT_RANKING_SETTINGS: RankingSettingsDto = {
  likesWeight: 2,
  followersWeight: 5,
  enableCronJob: true,
  enableFallbackRealtime: true,
  cronSchedule: '0 0 * * 1',
  lastSnapshotAt: null,
  lastSnapshotStatus: 'idle',
};
