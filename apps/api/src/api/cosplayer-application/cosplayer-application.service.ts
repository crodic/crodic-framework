import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Paginated,
  QueryBuilder,
  QueryParams,
} from '../../common/query-builder';
import { AutoIncrementID } from '../../common/types/common.type';
import { UserEntity } from '../user/entities/user.entity';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { NotificationEntity } from '../notification/entities/notification.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../notification/constants/notification.constant';
import { CosplayerApplicationEntity } from './entities/cosplayer-application.entity';
import { ECosplayerApplicationStatus } from './constants/cosplayer-application.constant';
import { CreateCosplayerApplicationReqDto } from './dto/create-cosplayer-application.req.dto';
import { ReviewCosplayerApplicationReqDto } from './dto/review-cosplayer-application.req.dto';
import { CosplayerApplicationResDto } from './dto/cosplayer-application.res.dto';

@Injectable()
export class CosplayerApplicationService {
  constructor(
    @InjectRepository(CosplayerApplicationEntity)
    private readonly appRepo: Repository<CosplayerApplicationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async submit(
    userId: AutoIncrementID,
    dto: CreateCosplayerApplicationReqDto,
  ): Promise<CosplayerApplicationResDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['cosplayerProfile'],
    });

    if (!user) {
      throw new NotFoundException('Tài khoản người dùng không tồn tại.');
    }

    if (!user.verifiedAt) {
      throw new BadRequestException(
        'Bạn cần xác minh địa chỉ email trước khi nộp đơn đăng ký làm Cosplayer chính thức.',
      );
    }

    if (user.cosplayerProfile?.isVerified) {
      throw new BadRequestException(
        'Tài khoản của bạn đã được xác minh là Cosplayer chính thức (đã có tích xanh).',
      );
    }

    const existingPending = await this.appRepo.findOne({
      where: {
        userId,
        status: ECosplayerApplicationStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        'Bạn đang có một đơn đăng ký đang chờ xét duyệt. Vui lòng đợi quản trị viên phản hồi.',
      );
    }

    const application = this.appRepo.create({
      userId,
      stageName: dto.stageName,
      bio: dto.bio,
      socialLinks: (dto.socialLinks as Record<string, string>) || null,
      portfolioUrls: dto.portfolioUrls || null,
      status: ECosplayerApplicationStatus.PENDING,
    });

    const saved = await this.appRepo.save(application);
    return saved.toDto(CosplayerApplicationResDto);
  }

  async getMyApplication(
    userId: AutoIncrementID,
  ): Promise<CosplayerApplicationResDto | null> {
    const latest = await this.appRepo.findOne({
      where: { userId },
      order: { id: 'DESC' },
      relations: ['user'],
    });

    return latest ? latest.toDto(CosplayerApplicationResDto) : null;
  }

  async findAll(
    query: QueryParams,
  ): Promise<Paginated<CosplayerApplicationResDto>> {
    const queryBuilder = this.appRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.reviewedBy', 'reviewedBy');

    const result = await QueryBuilder.for(queryBuilder, query)
      .allowedSorts(['id', 'createdAt', 'updatedAt', 'status', 'stageName'])
      .defaultSort('-id')
      .allowedFilters(['status', 'createdAt', 'stageName', 'bio'])
      .paginate();

    return new Paginated(
      result.data.map((item) => item.toDto(CosplayerApplicationResDto)),
      result.meta,
      result.links,
    );
  }

  async findOne(id: AutoIncrementID): Promise<CosplayerApplicationResDto> {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: ['user', 'user.cosplayerProfile', 'reviewedBy'],
    });

    if (!application) {
      throw new NotFoundException('Đơn đăng ký không tồn tại.');
    }

    return application.toDto(CosplayerApplicationResDto);
  }

  async review(
    id: AutoIncrementID,
    adminId: AutoIncrementID,
    dto: ReviewCosplayerApplicationReqDto,
  ): Promise<CosplayerApplicationResDto> {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: ['user', 'user.cosplayerProfile'],
    });

    if (!application) {
      throw new NotFoundException('Đơn đăng ký không tồn tại.');
    }

    if (
      dto.status === ECosplayerApplicationStatus.REJECTED &&
      !dto.rejectionReason?.trim()
    ) {
      throw new BadRequestException(
        'Vui lòng cung cấp lý do từ chối đơn đăng ký.',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      application.status = dto.status;
      application.rejectionReason =
        dto.status === ECosplayerApplicationStatus.REJECTED
          ? dto.rejectionReason?.trim() || null
          : null;
      application.reviewedById = adminId;
      application.reviewedAt = new Date();
      if (dto.adminNotes !== undefined) {
        application.adminNotes = dto.adminNotes?.trim() || null;
      }

      await manager.getRepository(CosplayerApplicationEntity).save(application);

      if (dto.status === ECosplayerApplicationStatus.APPROVED) {
        let profile = application.user?.cosplayerProfile;
        if (!profile) {
          profile = new CosplayerProfileEntity({
            userId: application.userId,
            slug:
              application.user?.username ||
              `user-${application.userId}-${Date.now().toString().slice(-4)}`,
            displayName: application.stageName,
            bio: application.bio,
            isVerified: true,
          });
        } else {
          profile.isVerified = true;
          if (!profile.displayName) {
            profile.displayName = application.stageName;
          }
          if (application.socialLinks) {
            if (application.socialLinks.facebook) {
              profile.facebookUrl = application.socialLinks.facebook;
            }
            if (application.socialLinks.instagram) {
              profile.instagramUrl = application.socialLinks.instagram;
            }
            if (application.socialLinks.tiktok) {
              profile.tiktokUrl = application.socialLinks.tiktok;
            }
            if (application.socialLinks.twitter) {
              profile.twitterUrl = application.socialLinks.twitter;
            }
          }
        }
        await manager.getRepository(CosplayerProfileEntity).save(profile);

        // Notify user of approval
        const notifRepo = manager.getRepository(NotificationEntity);
        await notifRepo.save(
          notifRepo.create({
            recipientUserId: application.userId,
            category: ENotificationCategory.SYSTEM,
            type: ENotificationType.BADGE_AWARDED,
            title: 'Đơn đăng ký Cosplayer đã được duyệt 🎉',
            description:
              'Chúc mừng! Hồ sơ của bạn đã được phê duyệt làm Cosplayer chính thức và nhận huy hiệu tích xanh xác thực.',
            actionUrl: '/profile',
          }),
        );
      } else if (dto.status === ECosplayerApplicationStatus.REJECTED) {
        const notifRepo = manager.getRepository(NotificationEntity);
        await notifRepo.save(
          notifRepo.create({
            recipientUserId: application.userId,
            category: ENotificationCategory.SYSTEM,
            type: ENotificationType.SECURITY,
            title: 'Đơn đăng ký Cosplayer chưa được duyệt',
            description: `Rất tiếc, đơn đăng ký trở thành Cosplayer của bạn chưa được duyệt. Lý do: ${dto.rejectionReason}`,
            actionUrl: '/profile',
          }),
        );
      }
    });

    return this.findOne(id);
  }
}
