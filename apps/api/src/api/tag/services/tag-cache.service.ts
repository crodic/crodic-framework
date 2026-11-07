import { AutoIncrementID } from '../../../common/types/common.type';
import { RedisService } from '../../../redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

const CACHE_VER_KEY = 'tag:cache_ver';

@Injectable()
export class TagCacheService {
  private readonly logger = new Logger(TagCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async getVersion(): Promise<string> {
    try {
      const ver = await this.redisService.get(CACHE_VER_KEY);
      return ver || '1';
    } catch {
      return '1';
    }
  }

  /**
   * O(1) cache invalidation across autocomplete and tooltip caches by bumping namespace version.
   */
  async bumpVersion(): Promise<void> {
    try {
      await this.redisService.getClient().incr(CACHE_VER_KEY);
    } catch (err) {
      this.logger.debug(
        `Redis unavailable during cache bump: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const ver = await this.getVersion();
      const raw = await this.redisService.get(`tag:v${ver}:${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      const ver = await this.getVersion();
      // Add slight jitter (0-15s) to prevent cache stampede on hot tags
      const jitter = Math.floor(Math.random() * 15);
      await this.redisService.set(
        `tag:v${ver}:${key}`,
        JSON.stringify(value),
        ttlSeconds + jitter,
      );
    } catch (err) {
      this.logger.debug(
        `Redis unavailable during cache set: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async recordTagActivity(tagId: AutoIncrementID, weight = 1): Promise<void> {
    try {
      const bucket = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const key = `tag:trending:${bucket}`;
      const client = this.redisService.getClient();
      await client.zincrby(key, weight, String(tagId));
      await this.redisService.expire(key, 8 * 24 * 3600);
    } catch {
      // Non-blocking metrics
    }
  }

  async getTopTrendingTagIds(limit = 20): Promise<AutoIncrementID[]> {
    try {
      const bucket = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const key = `tag:trending:${bucket}`;
      const ids = await this.redisService
        .getClient()
        .zrevrange(key, 0, limit - 1);
      return ids as AutoIncrementID[];
    } catch {
      return [];
    }
  }

  async getUserMutedCache(
    userId: AutoIncrementID,
  ): Promise<AutoIncrementID[] | null> {
    try {
      const raw = await this.redisService.get(`user:${userId}:muted_tag_ids`);
      if (!raw) return null;
      return JSON.parse(raw) as AutoIncrementID[];
    } catch {
      return null;
    }
  }

  async setUserMutedCache(
    userId: AutoIncrementID,
    tagIds: AutoIncrementID[],
  ): Promise<void> {
    try {
      await this.redisService.set(
        `user:${userId}:muted_tag_ids`,
        JSON.stringify(tagIds),
        3600,
      );
    } catch {
      // Non-blocking
    }
  }

  async invalidateUserMutedCache(userId: AutoIncrementID): Promise<void> {
    try {
      await this.redisService.del(`user:${userId}:muted_tag_ids`);
    } catch {
      // Non-blocking
    }
  }
}
