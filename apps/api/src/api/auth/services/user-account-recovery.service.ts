import { UserAccountEntity } from '../../user/entities/user-account.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { CollectionEntity } from '../../collection/entities/collection.entity';
import { PostCommentEntity } from '../../post/entities/post-comment.entity';
import { AllConfigType } from '../../../config/config.type';
import {
  EAccountProvider,
  ESessionUserType,
} from '../../../common/constants/entity.enum';
import { AutoIncrementID } from '../../../common/types/common.type';
import { normalizeEmail } from '../../../utils/normalize.util';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { EmailQueueService } from '../../../background/queues/email-queue/email-queue.service';
import { ForgotPasswordReqDto } from '../dto/forgot-password.req.dto';
import { ResetPasswordReqDto } from '../dto/reset-password.req.dto';
import { ResetPasswordResDto } from '../dto/reset-password.res.dto';
import {
  AccountRecoveryConfig,
  AccountRecoveryService,
} from './account-recovery.service';
import { AuthRecoveryService } from './auth-recovery.service';
import { AuthSessionService } from './auth-session.service';

@Injectable()
export class UserAccountRecoveryService extends AccountRecoveryService<UserEntity> {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    authRecoveryService: AuthRecoveryService,
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
    emailQueueService: EmailQueueService,
    private readonly authSessionService: AuthSessionService,
    private readonly dataSource: DataSource,
  ) {
    super(authRecoveryService, userRepository, emailQueueService);
  }

  protected getRecoveryConfig(): AccountRecoveryConfig {
    const clientResetPasswordUrl = this.configService.getOrThrow(
      'auth.clientResetPasswordUrl',
      { infer: true },
    );
    const appUrl = this.configService.getOrThrow('app.url', { infer: true });

    return {
      scope: ESessionUserType.USER,
      confirmEmailSecret: this.configService.getOrThrow(
        'auth.userConfirmEmailSecret',
        { infer: true },
      ),
      confirmEmailExpires: this.configService.getOrThrow(
        'auth.userConfirmEmailExpires',
        { infer: true },
      ),
      confirmEmailTemplate: 'user-email-verification',
      confirmEmailSubject: 'Verify your account',
      confirmEmailUrl: (token) =>
        `${appUrl}/api/v1/user/auth/verify/email?token=${token}`,
      forgotSecret: this.configService.getOrThrow('auth.userForgotSecret', {
        infer: true,
      }),
      forgotExpires: this.configService.getOrThrow('auth.userForgotExpires', {
        infer: true,
      }),
      forgotPasswordTemplate: 'user-email-reset-password',
      forgotPasswordSubject: 'Reset your password',
      forgotPasswordUrl: (token) => `${clientResetPasswordUrl}?token=${token}`,
    };
  }

  protected async saveLocalAccountPassword(
    user: UserEntity,
    password: string,
  ): Promise<void> {
    let localAccount = await this.userAccountRepository.findOne({
      where: { userId: user.id, provider: EAccountProvider.LOCAL },
    });

    if (!localAccount) {
      localAccount = new UserAccountEntity({
        userId: user.id,
        provider: EAccountProvider.LOCAL,
        providerAccountId: user.email,
        password,
        email: user.email,
      });
    } else {
      localAccount.password = password;
    }

    await this.userAccountRepository.save(localAccount);
  }

  protected override async onPasswordResetSuccess(
    user: UserEntity,
  ): Promise<void> {
    // Revoke all existing sessions for this user upon password reset
    await this.authSessionService.revokeAllUserSessions({
      userId: user.id,
      userType: ESessionUserType.USER,
    });
  }

  async sendRestoreEmail(
    user: UserEntity,
    options?: { skipRateLimit?: boolean },
  ): Promise<void> {
    const config = this.getRecoveryConfig();

    if (!options?.skipRateLimit) {
      await this.authRecoveryService.checkEmailRateLimit({
        target: user.id,
        action: 'restore',
        scope: config.scope,
      });
    }

    const { token } =
      await this.authRecoveryService.createAndCacheVerificationToken({
        userId: user.id,
        scope: config.scope,
        secret: config.forgotSecret,
        expiresIn: config.forgotExpires,
        cacheKeyPrefix: 'restore_account:' as any,
      });

    const clientUrl = this.configService.getOrThrow('auth.clientUrl', {
      infer: true,
    });

    const restoreUrl = `${clientUrl}/auth/restore?token=${token}`;

    await this.emailQueueService.sendMail({
      to: user.email,
      subject: 'Restore your account',
      template: 'user-email-restore',
      context: {
        email: user.email,
        url: restoreUrl,
      },
    });

    if (!options?.skipRateLimit) {
      await this.authRecoveryService.recordEmailSent({
        target: user.id,
        action: 'restore',
        scope: config.scope,
      });
    }
  }

  async requestRestore(
    dto: ForgotPasswordReqDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: normalizeEmail(dto.email) },
      withDeleted: true,
    });

    if (!user || !user.deletedAt) {
      return {
        message:
          'If your account was deleted, a restoration email has been sent.',
      };
    }

    await this.sendRestoreEmail(user);

    return {
      message:
        'If your account was deleted, a restoration email has been sent.',
    };
  }

  async restoreAccount(
    token: string,
    dto: ResetPasswordReqDto,
  ): Promise<ResetPasswordResDto> {
    const config = this.getRecoveryConfig();
    const { id } = await this.authRecoveryService.verifyAndConsumeToken({
      token,
      scope: config.scope,
      secret: config.forgotSecret,
      cacheKeyPrefix: 'restore_account:' as any,
    });

    const user = await this.userRepository.findOne({
      where: { id: id as AutoIncrementID },
      withDeleted: true,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const activeUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (activeUser && String(activeUser.id) !== String(user.id)) {
      throw new ConflictException(
        'An active user already exists with this email address',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserEntity).restore(user.id);
      await manager
        .getRepository(CosplayerProfileEntity)
        .restore({ userId: user.id });
      await manager.getRepository(PostEntity).restore({ authorId: user.id });
      await manager
        .getRepository(CollectionEntity)
        .restore({ userId: user.id });
      await manager
        .getRepository(PostCommentEntity)
        .restore({ authorId: user.id });
    });

    user.deletedAt = null;
    await this.saveLocalAccountPassword(user, dto.password);

    await this.authSessionService.revokeAllUserSessions({
      userId: user.id,
      userType: ESessionUserType.USER,
    });

    return plainToInstance(ResetPasswordResDto, {
      success: true,
      message: 'Account restored successfully. Please sign in to continue.',
    });
  }
}
