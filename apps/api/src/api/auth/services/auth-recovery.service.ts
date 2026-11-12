import { AutoIncrementID } from '../../../common/types/common.type';
import { CacheKey } from '../../../common/constants/cache.constant';
import { ESessionUserType } from '../../../common/constants/entity.enum';
import { createCacheKey } from '../../../utils/cache.util';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import ms, { StringValue } from 'ms';

export type VerificationTokenPayload = {
  id: string | AutoIncrementID;
  /** User table the token was issued for (admin / user). */
  scope?: ESessionUserType;
};

@Injectable()
export class AuthRecoveryService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Signs a one-time verification token and stores it in cache.
   *
   * Multi-table safety: admin and user IDs come from separate auto-increment
   * sequences and can overlap, so both the cache key and the JWT payload are
   * scoped by `scope` (user type). Issuing a new token overwrites the previous
   * one, which invalidates any older token for the same account.
   */
  async createAndCacheVerificationToken(params: {
    userId: string | AutoIncrementID;
    scope: ESessionUserType;
    secret: string;
    expiresIn: string;
    cacheKeyPrefix: CacheKey;
  }): Promise<{ token: string; expiresIn: string }> {
    const token = await this.jwtService.signAsync(
      { id: String(params.userId), scope: params.scope },
      {
        secret: params.secret,
        expiresIn: params.expiresIn as StringValue,
      },
    );

    await this.cacheManager.set(
      createCacheKey(
        params.cacheKeyPrefix,
        params.scope,
        String(params.userId),
      ),
      token,
      ms(params.expiresIn as StringValue),
    );

    return { token, expiresIn: params.expiresIn };
  }

  /**
   * Verifies the token signature, scope and that it is the latest token issued
   * for this account, then consumes it (single use).
   */
  async verifyAndConsumeToken(params: {
    token: string;
    scope: ESessionUserType;
    secret: string;
    cacheKeyPrefix: CacheKey;
  }): Promise<{ id: string }> {
    let payload: VerificationTokenPayload;
    try {
      payload = this.jwtService.verify<VerificationTokenPayload>(params.token, {
        secret: params.secret,
      });
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (!payload?.id || payload.scope !== params.scope) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const cacheKey = createCacheKey(
      params.cacheKeyPrefix,
      params.scope,
      String(payload.id),
    );
    const cachedToken = await this.cacheManager.get<string>(cacheKey);

    if (!cachedToken || !this.safeEqual(cachedToken, params.token)) {
      throw new BadRequestException(
        'Verification token has expired or already used',
      );
    }

    await this.cacheManager.del(cacheKey);
    return { id: String(payload.id) };
  }

  async verifyTokenOnly(params: {
    token: string;
    secret: string;
  }): Promise<{ id: string }> {
    try {
      const payload = this.jwtService.verify<VerificationTokenPayload>(
        params.token,
        { secret: params.secret },
      );
      return { id: String(payload.id) };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  /**
   * Anti-Spam Layer: Checks both the 60s cooldown and the daily limit (default 5/day)
   * for a target user ID / account. Throws 429 Too Many Requests if exceeded.
   */
  async checkEmailRateLimit(params: {
    target: string | AutoIncrementID;
    action: 'verify' | 'forgot' | 'restore';
    scope: ESessionUserType;
    cooldownSeconds?: number;
    dailyLimit?: number;
  }): Promise<void> {
    const cooldownSeconds = params.cooldownSeconds ?? 60;
    const dailyLimit = params.dailyLimit ?? 5;

    const cooldownKey = createCacheKey(
      CacheKey.EMAIL_COOLDOWN,
      params.action,
      params.scope,
      String(params.target),
    );

    const isCoolingDown = await this.cacheManager.get<boolean>(cooldownKey);
    if (isCoolingDown) {
      throw new HttpException(
        {
          code: 'EMAIL_COOLDOWN',
          message: `Please wait before requesting another email. Try again in ${cooldownSeconds} seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = createCacheKey(
      CacheKey.EMAIL_DAILY_COUNT,
      params.action,
      params.scope,
      String(params.target),
      today,
    );

    const currentCount = (await this.cacheManager.get<number>(dailyKey)) || 0;
    if (currentCount >= dailyLimit) {
      throw new HttpException(
        {
          code: 'EMAIL_DAILY_LIMIT_EXCEEDED',
          message: `You have reached the maximum number of email requests for today (limit: ${dailyLimit}). Please try again tomorrow.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Records that an email was sent in Redis: sets the 60s cooldown and increments daily counter.
   */
  async recordEmailSent(params: {
    target: string | AutoIncrementID;
    action: 'verify' | 'forgot' | 'restore';
    scope: ESessionUserType;
    cooldownSeconds?: number;
  }): Promise<void> {
    const cooldownSeconds = params.cooldownSeconds ?? 60;
    const cooldownKey = createCacheKey(
      CacheKey.EMAIL_COOLDOWN,
      params.action,
      params.scope,
      String(params.target),
    );
    await this.cacheManager.set(cooldownKey, true, cooldownSeconds * 1000);

    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = createCacheKey(
      CacheKey.EMAIL_DAILY_COUNT,
      params.action,
      params.scope,
      String(params.target),
      today,
    );
    const currentCount = (await this.cacheManager.get<number>(dailyKey)) || 0;
    await this.cacheManager.set(
      dailyKey,
      currentCount + 1,
      24 * 60 * 60 * 1000,
    );
  }

  private safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return (
      bufferA.length === bufferB.length &&
      crypto.timingSafeEqual(bufferA, bufferB)
    );
  }
}
