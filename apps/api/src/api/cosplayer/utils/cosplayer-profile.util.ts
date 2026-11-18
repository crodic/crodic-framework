import { In, Repository } from 'typeorm';
import { AutoIncrementID } from '../../../common/types/common.type';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileEntity } from '../entities/cosplayer-profile.entity';

export interface FormattedCosplayerDisplay {
  displayName: string;
  handle?: string;
  avatarUrl?: string | null;
  portfolioHref?: string;
  isVerified: boolean;
  roleBadge?: string | null;
}

export class CosplayerProfileUtil {
  /**
   * Batch load Cosplayer profiles for a given list of user IDs into a Map keyed by String(userId).
   */
  static async loadProfilesMap(
    profileRepo: Repository<CosplayerProfileEntity>,
    userIds: AutoIncrementID[],
  ): Promise<Map<string, CosplayerProfileEntity>> {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      return new Map();
    }
    const profiles = await profileRepo.find({
      where: { userId: In(uniqueIds) },
    });
    return new Map(profiles.map((p) => [String(p.userId), p]));
  }

  /**
   * Format cosplayer display data, encapsulating fallback resolution.
   */
  static formatDisplay(
    profile?: CosplayerProfileEntity | null,
    user?: UserEntity | null,
  ): FormattedCosplayerDisplay {
    const displayName = profile?.displayName || user?.fullName || 'Cosplayer';
    const slug = profile?.slug;

    return {
      displayName,
      handle: slug ? `@${slug}` : undefined,
      avatarUrl: profile?.avatarUrl ?? null,
      portfolioHref: slug ? `/cosplayer/${slug}` : undefined,
      isVerified: profile?.isVerified ?? false,
      roleBadge: profile?.roleBadge ?? null,
    };
  }
}
