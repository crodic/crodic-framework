import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserEntity } from '../../../api/user/entities/user.entity';
import { UserAccountEntity } from '../../../api/user/entities/user-account.entity';
import { EUserRole } from '../../../api/user/constants/user.constant';
import { EAccountProvider } from '../../../common/constants/entity.enum';
import { CosplayerProfileEntity } from '../../../api/cosplayer/entities/cosplayer-profile.entity';
import { CosplayerServiceEntity } from '../../../api/cosplayer/entities/cosplayer-service.entity';
import { CosplayerCharacterEntity } from '../../../api/cosplayer/entities/cosplayer-character.entity';
import { PostEntity } from '../../../api/post/entities/post.entity';
import { PostMediaEntity } from '../../../api/post/entities/post-media.entity';
import { PostLikeEntity } from '../../../api/post/entities/post-like.entity';
import { PostCommentEntity } from '../../../api/post/entities/post-comment.entity';
import {
  EAlbumCategory,
  EMediaType,
  EPostStatus,
  EPostType,
} from '../../../api/post/constants/post.constant';
import { UserFollowEntity } from '../../../api/social/entities/user-follow.entity';
import { CollectionEntity } from '../../../api/collection/entities/collection.entity';
import { CollectionItemEntity } from '../../../api/collection/entities/collection-item.entity';
import { BrandEntity } from '../../../api/brand/entities/brand.entity';
import { JobEntity } from '../../../api/job/entities/job.entity';
import {
  EJobCategory,
  EJobStatus,
} from '../../../api/job/constants/job.constant';
import { EventEntity } from '../../../api/event/entities/event.entity';
import { EventParticipantEntity } from '../../../api/event/entities/event-participant.entity';
import { EEventStatus } from '../../../api/event/constants/event.constant';
import { SpotlightBannerEntity } from '../../../api/spotlight/entities/spotlight-banner.entity';
import { LeaderboardSnapshotEntity } from '../../../api/ranking/entities/leaderboard-snapshot.entity';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../../../api/ranking/constants/ranking.constant';
import { NotificationEntity } from '../../../api/notification/entities/notification.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../../../api/notification/constants/notification.constant';

@Injectable()
export class KosumeSeedService {
  private readonly logger = new Logger(KosumeSeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly accountRepo: Repository<UserAccountEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(CosplayerServiceEntity)
    private readonly serviceRepo: Repository<CosplayerServiceEntity>,
    @InjectRepository(CosplayerCharacterEntity)
    private readonly charRepo: Repository<CosplayerCharacterEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(PostMediaEntity)
    private readonly mediaRepo: Repository<PostMediaEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepo: Repository<PostLikeEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepo: Repository<PostCommentEntity>,
    @InjectRepository(UserFollowEntity)
    private readonly followRepo: Repository<UserFollowEntity>,
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(CollectionItemEntity)
    private readonly collectionItemRepo: Repository<CollectionItemEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
    @InjectRepository(JobEntity)
    private readonly jobRepo: Repository<JobEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(EventParticipantEntity)
    private readonly participantRepo: Repository<EventParticipantEntity>,
    @InjectRepository(SpotlightBannerEntity)
    private readonly spotlightRepo: Repository<SpotlightBannerEntity>,
    @InjectRepository(LeaderboardSnapshotEntity)
    private readonly leaderboardRepo: Repository<LeaderboardSnapshotEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding Kosume domain data...');

    // 1. Seed Users & Profiles
    const usersData = [
      {
        email: 'kiriko@kosume.com',
        username: 'kiriko',
        firstName: 'KIRIKO',
        lastName: 'Cosplayer',
        role: EUserRole.COSPLAYER,
        avatar: '/landing/avatar-kiriko.jpg',
        profile: {
          slug: 'kiriko',
          displayName: 'KIRIKO',
          handle: 'kirikocos',
          roleBadge: 'Cosplayer Pro',
          tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
          bio: 'Tiểu sử ngắn nhân viên, xuất sắc, khoa vẽ cosplay nhóm.',
          artisticBio:
            'Chào mừng bạn đến với không gian nghệ thuật của Kiriko! Với hơn 5 năm gắn bó cùng nghệ thuật hóa thân Cosplay, Kiriko luôn hướng tới sự chỉn chu và cảm xúc trọn vẹn trong từng nhân vật. Từ phục trang, makeup đến thần thái biểu cảm, mỗi tác phẩm là một câu chuyện được kể bằng tất cả nhiệt huyết.',
          avatarUrl: '/landing/avatar-kiriko.jpg',
          coverUrl: '/landing/hero-banner.png',
          locationLabel: 'HÀ NỘI, VN',
          workArea: 'Hà Nội & Toàn quốc',
          heightCm: 165,
          heightLabel: '1m65',
          experienceYearsNum: 5,
          experienceLabel: '5 năm kinh nghiệm',
          skills: [
            'Crafting Đạo Cụ',
            'Make-up Chuyên Nghiệp',
            'Diễn Xuất Sân Khấu',
            'Photoset Studio',
          ],
          specialties: [
            'Genshin Impact',
            'Honkai: Star Rail',
            'Frieren',
            'Fate Series',
          ],
          awardsBadges: [
            'Top 1 Cosplayer of the Year 2025',
            'Best Prop Master Winter Fest 2024',
          ],
          contactEmail: 'kiriko.cosplay@gmail.com',
          contactPhone: '0987 654 321',
          facebookUrl: 'https://facebook.com/kiriko.cosplay',
          instagramUrl: 'https://instagram.com/kirikocos',
          tiktokUrl: 'https://tiktok.com/@kirikocos',
          twitterUrl: 'https://x.com/kirikocos',
          isVerified: true,
          isAcceptingBooking: true,
          isCraftingCreator: true,
          followersCount: 12500,
          followingCount: 18,
          totalLikesCount: 85200,
          albumsCount: 24,
          charactersCount: 12,
          collectionsCount: 6,
          rankingScore: 98.5,
        },
      },
      {
        email: 'soriko@kosume.com',
        username: 'sorikocos',
        firstName: 'Soriko',
        lastName: 'Studio',
        role: EUserRole.COSPLAYER,
        avatar: '/landing/avatar-soriko.jpg',
        profile: {
          slug: 'sorikocos',
          displayName: 'Soriko',
          handle: 'sorikocos',
          roleBadge: 'Costume Maker • Cosplayer',
          tagline: 'Chuyên phục trang và đạo cụ cosplay thủ công tinh xảo',
          bio: 'Maker phục trang & Cosplayer tự do tại TP.HCM.',
          avatarUrl: '/landing/avatar-soriko.jpg',
          coverUrl: '/landing/hero-banner.png',
          locationLabel: 'TP.HCM, VN',
          workArea: 'TP.HCM & Toàn quốc',
          heightCm: 162,
          heightLabel: '1m62',
          experienceYearsNum: 4,
          experienceLabel: '4 năm kinh nghiệm',
          skills: ['May phục trang cao cấp', 'Make-up', 'Tạo mẫu tóc Wig'],
          specialties: ['Honkai: Star Rail', 'Zenless Zone Zero'],
          contactEmail: 'soriko.studio@gmail.com',
          isVerified: true,
          isAcceptingBooking: true,
          isCraftingCreator: true,
          followersCount: 9800,
          followingCount: 35,
          totalLikesCount: 72400,
          albumsCount: 16,
          charactersCount: 8,
          collectionsCount: 4,
          rankingScore: 94.2,
        },
      },
      {
        email: 'acheron.vn@kosume.com',
        username: 'acheron_vn',
        firstName: 'Acheron',
        lastName: 'VN',
        role: EUserRole.COSPLAYER,
        avatar: '/landing/avatar-acheron.jpg',
        profile: {
          slug: 'acheron_vn',
          displayName: 'Acheron_VN',
          handle: 'acheron_vn',
          roleBadge: 'Model • Crafting',
          tagline: 'Khởi nguyên lôi thần - Thần thái và phục trang đỉnh cao',
          bio: 'Chuyên phong cách visual mạnh mẽ và concept anime dark fantasy.',
          avatarUrl: '/landing/avatar-acheron.jpg',
          coverUrl: '/landing/hero-banner.png',
          locationLabel: 'Đà Nẵng, VN',
          workArea: 'Toàn quốc',
          heightCm: 168,
          heightLabel: '1m68',
          experienceYearsNum: 3,
          experienceLabel: '3 năm kinh nghiệm',
          skills: ['Photoset Ngoại cảnh', 'Diễn xuất Action'],
          specialties: ['Honkai: Star Rail', 'NieR:Automata'],
          contactEmail: 'acheron.vn@gmail.com',
          isVerified: true,
          isAcceptingBooking: false,
          followersCount: 8400,
          followingCount: 22,
          totalLikesCount: 65700,
          albumsCount: 12,
          charactersCount: 6,
          collectionsCount: 2,
          rankingScore: 89.1,
        },
      },
      {
        email: 'haianh.fan@gmail.com',
        username: 'haianh_fan',
        firstName: 'Hải',
        lastName: 'Anh',
        role: EUserRole.FAN,
        avatar: '/landing/cosplay-work-6.jpg',
      },
    ];

    const savedUsers: Record<string, UserEntity> = {};

    for (const u of usersData) {
      let user = await this.userRepo.findOne({
        where: { email: u.email },
        withDeleted: true,
      });

      if (!user) {
        user = await this.userRepo.save(
          this.userRepo.create({
            email: u.email,
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            avatar: u.avatar,
            verifiedAt: new Date(),
          }),
        );

        await this.accountRepo.save(
          new UserAccountEntity({
            userId: user.id,
            provider: EAccountProvider.LOCAL,
            providerAccountId: user.email,
            password: 'Password123!',
            email: user.email,
            displayName: `${user.firstName} ${user.lastName}`.trim(),
          }),
        );
      } else {
        user.username = u.username;
        user.role = u.role;
        user.avatar = u.avatar;
        await this.userRepo.save(user);
      }

      savedUsers[u.username] = user;

      // Upsert profile for cosplayers only
      if (u.role === EUserRole.COSPLAYER && 'profile' in u && u.profile) {
        const existingProfile = await this.profileRepo.findOne({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          const newProfile = this.profileRepo.create({
            userId: user.id,
            ...u.profile,
          } as DeepPartial<CosplayerProfileEntity>);
          await this.profileRepo.save(newProfile);
        } else {
          Object.assign(existingProfile, u.profile);
          await this.profileRepo.save(existingProfile);
        }
      } else {
        await this.profileRepo.delete({ userId: user.id });
      }
    }

    const kirikoUser = savedUsers['kiriko'];
    const sorikoUser = savedUsers['sorikocos'];
    const haianhUser = savedUsers['haianh_fan'];

    // 2. Seed Services for KIRIKO
    const servicesCount = await this.serviceRepo.count({
      where: { userId: kirikoUser.id },
    });
    if (servicesCount === 0) {
      await this.serviceRepo.save([
        this.serviceRepo.create({
          userId: kirikoUser.id,
          title: 'Chụp Photoset Studio / Ngoại cảnh',
          description:
            'Phục trang chuẩn bị tỉ mỉ, diễn xuất theo concept yêu cầu, hỗ trợ ekip chuyên nghiệp.',
          badgeLabel: 'Theo thỏa thuận',
          sortOrder: 1,
          isActive: true,
        }),
        this.serviceRepo.create({
          userId: kirikoUser.id,
          title: 'Khách mời Sự kiện & Catwalk',
          description:
            'Tham gia giao lưu, ký tặng fans, biểu diễn catwalk sân khấu chính festival.',
          badgeLabel: 'Nhận lịch trước 2 tuần',
          sortOrder: 2,
          isActive: true,
        }),
        this.serviceRepo.create({
          userId: kirikoUser.id,
          title: 'Review Game & Hợp tác Nhãn hàng',
          description:
            'Quảng bá sản phẩm, livestream trải nghiệm game và chụp ảnh lookbook thương mại.',
          badgeLabel: 'Trao đổi qua Email',
          sortOrder: 3,
          isActive: true,
        }),
      ]);
    }

    // 3. Seed Characters for KIRIKO
    const charsCount = await this.charRepo.count({
      where: { userId: kirikoUser.id },
    });
    if (charsCount === 0) {
      await this.charRepo.save([
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Raiden Shogun',
          seriesName: 'Genshin Impact',
          coverImageUrl: '/landing/art-raiden-1.jpg',
          albumsCount: 6,
          photosCount: 42,
          sortOrder: 1,
        }),
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Acheron',
          seriesName: 'Honkai: Star Rail',
          coverImageUrl: '/landing/art-acheron.jpg',
          albumsCount: 8,
          photosCount: 56,
          sortOrder: 2,
        }),
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Kafka',
          seriesName: 'Honkai: Star Rail',
          coverImageUrl: '/landing/art-kafka.jpg',
          albumsCount: 5,
          photosCount: 35,
          sortOrder: 3,
        }),
      ]);
    }

    // 4. Seed Brands
    const brandsData = [
      {
        name: 'HoYoverse VN',
        slug: 'hoyoverse-vn',
        initials: 'HYV',
        color: 'bg-blue-600',
        contactEmail: 'recruitment@hoyoverse.vn',
        isVerified: true,
        tagline: 'Tech Otakus Save the World',
        description:
          'Nhà phát hành chính thức các tựa game đình đám Genshin Impact, Honkai: Star Rail, Zenless Zone Zero.',
      },
      {
        name: 'VNG Games',
        slug: 'vng-games',
        initials: 'VNG',
        color: 'bg-orange-600',
        contactEmail: 'talent@vnggames.vn',
        isVerified: true,
        tagline: 'Nhà phát hành game hàng đầu Việt Nam',
        description:
          'VNG Games chuyên phát hành các sản phẩm game MMORPG và Esports.',
      },
      {
        name: 'Garena VN',
        slug: 'garena-vn',
        initials: 'GAR',
        color: 'bg-red-600',
        contactEmail: 'cosplay@garena.vn',
        isVerified: true,
        tagline: 'Connecting dots with passion',
        description: 'Đơn vị phát hành Liên Quân Mobile, Free Fire.',
      },
    ];

    const savedBrands: Record<string, BrandEntity> = {};
    for (const b of brandsData) {
      let brand = await this.brandRepo.findOne({ where: { slug: b.slug } });
      if (!brand) {
        brand = await this.brandRepo.save(
          this.brandRepo.create({
            ownerUserId: kirikoUser.id,
            ...b,
          }),
        );
      }
      savedBrands[b.slug] = brand;
    }

    // 5. Seed Jobs
    const jobsCount = await this.jobRepo.count();
    if (jobsCount === 0) {
      await this.jobRepo.save([
        this.jobRepo.create({
          slug: 'tuyen-cosplayer-acheron-firefly-su-kien-ra-mat',
          brandId: savedBrands['hoyoverse-vn'].id,
          posterUserId: kirikoUser.id,
          brandName: 'HoYoverse VN',
          brandLogoUrl: '/landing/art-acheron.jpg',
          brandInitials: 'HYV',
          brandColor: 'bg-blue-600',
          isVerified: true,
          title: 'Tuyển Cosplayer Acheron & Firefly sự kiện ra mắt',
          categoryCode: EJobCategory.EVENT,
          categoryLabel: 'Guest Sự kiện',
          budgetLabel: '5.000.000đ - 8.000.000đ / ngày',
          budgetMin: 5000000,
          budgetMax: 8000000,
          locationLabel: 'TP.HCM',
          locationFilterCode: 'hcm',
          deadlineLabel: '20/12/2026',
          deadlineAt: new Date('2026-12-20T23:59:59Z'),
          requirements: 'Kinh nghiệm diễn xuất, makeup tự nhiên',
          description:
            'Tuyển chọn 2 cosplayer hóa thân nhân vật Acheron và Firefly cho buổi offline ra mắt phiên bản mới của Honkai: Star Rail tại TP.HCM. Công việc bao gồm chụp ảnh cùng fans, tham gia mini game trên sân khấu chính và giao lưu truyền thông.',
          perks: [
            'Trang phục và đạo cụ cao cấp được tài trợ 100%',
            'Hỗ trợ makeup artist chuyên nghiệp đi kèm',
            'Thù lao thanh toán ngay sau ngày diễn ra sự kiện',
            'Cơ hội ký hợp đồng đại sứ dài hạn cho các dự án tiếp theo',
          ],
          filterTags: ['all', 'event', 'game_ads', 'hcm'],
          contactEmail: 'recruitment@hoyoverse.vn',
          thumbnailUrl: '/landing/art-acheron.jpg',
          isFeatured: true,
          status: EJobStatus.OPEN,
          applicationsCount: 14,
        }),
        this.jobRepo.create({
          slug: 'booking-mau-anh-trang-phuc-co-trang-studio',
          brandId: savedBrands['vng-games'].id,
          posterUserId: kirikoUser.id,
          brandName: 'VNG Games',
          brandLogoUrl: '/landing/art-kafka.jpg',
          brandInitials: 'VNG',
          brandColor: 'bg-orange-600',
          isVerified: true,
          title: 'Booking Mẫu ảnh trang phục cổ trang Studio',
          categoryCode: EJobCategory.LOOKBOOK,
          categoryLabel: 'Mẫu ảnh / Lookbook',
          budgetLabel: '3.000.000đ - 5.000.000đ / ngày',
          budgetMin: 3000000,
          budgetMax: 5000000,
          locationLabel: 'Hà Nội',
          locationFilterCode: 'hanoi',
          deadlineLabel: '15/12/2026',
          deadlineAt: new Date('2026-12-15T23:59:59Z'),
          requirements: 'Cao từ 1m62, biểu cảm tốt',
          description:
            'VNG Games tìm kiếm các bạn nữ cosplayer có nét đẹp cổ trang, biểu cảm linh hoạt và khả năng tạo dáng kiếm hiệp để thực hiện bộ ảnh lookbook quảng bá tựa game MMORPG kiếm hiệp sắp phát hành.',
          perks: [
            'Ekip studio ánh sáng và nhiếp ảnh gia hàng đầu',
            'Có người hỗ trợ phục trang, làm tóc và dặm phấn liên tục',
            'Trả ảnh retouch chất lượng cao cho portfolio cá nhân',
          ],
          filterTags: ['all', 'lookbook', 'game_ads', 'hanoi'],
          contactEmail: 'talent@vnggames.vn',
          thumbnailUrl: '/landing/art-kafka.jpg',
          isFeatured: true,
          status: EJobStatus.OPEN,
          applicationsCount: 8,
        }),
        this.jobRepo.create({
          slug: 'cosplayer-tuong-lien-quan-festival-mua-dong',
          brandId: savedBrands['garena-vn'].id,
          posterUserId: kirikoUser.id,
          brandName: 'Garena VN',
          brandLogoUrl: '/landing/art-raiden-1.jpg',
          brandInitials: 'GAR',
          brandColor: 'bg-red-600',
          isVerified: true,
          title: 'Cosplayer Tướng Liên Quân Festival Mùa Đông',
          categoryCode: EJobCategory.EVENT,
          categoryLabel: 'Guest Sự kiện',
          budgetLabel: '4.000.000đ - 6.000.000đ / ngày',
          budgetMin: 4000000,
          budgetMax: 6000000,
          locationLabel: 'TP.HCM',
          locationFilterCode: 'hcm',
          deadlineLabel: '18/12/2026',
          deadlineAt: new Date('2026-12-18T23:59:59Z'),
          requirements: 'Tự tin catwalk sân khấu, tương tác ống kính',
          description:
            'Tuyển dàn cosplayer hóa thân các vị tướng Lauriel, Điêu Thuyền, Nakroth tham gia diễu hành và chụp ảnh lưu niệm tại Chung kết Đấu Trường Danh Vọng Mùa Đông 2026.',
          perks: [
            'Vé VIP trọn gói tham dự toàn bộ ngày hội',
            'Khu vực lounge riêng dành cho khách mời',
            'Bộ quà tặng độc quyền merchandise giải đấu',
          ],
          filterTags: ['all', 'event', 'hcm'],
          contactEmail: 'cosplay@garena.vn',
          thumbnailUrl: '/landing/art-raiden-1.jpg',
          isFeatured: true,
          status: EJobStatus.OPEN,
          applicationsCount: 19,
        }),
      ]);
    }

    // 6. Seed Events
    const eventsCount = await this.eventRepo.count();
    if (eventsCount === 0) {
      const event1 = await this.eventRepo.save(
        this.eventRepo.create({
          slug: 'vietnam-cosplay-festival-2026',
          title: 'Vietnam Cosplay Festival 2026',
          dayLabel: '15',
          monthLabel: 'Th12',
          yearLabel: '2026',
          dateString: '15/12/2026',
          startAt: new Date('2026-12-15T08:00:00Z'),
          endAt: new Date('2026-12-15T21:00:00Z'),
          locationLabel: 'TP.HCM',
          locationFilterCode: 'hcm',
          venue: 'SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7',
          imageUrl: '/landing/cosplay-work-1.jpg',
          bannerImageUrl: '/landing/hero-banner.png',
          description:
            'Lễ hội Cosplay lớn nhất năm 2026 quy tụ hơn 500 creator, nghệ sĩ đạo cụ và khách mời quốc tế. Không gian trải nghiệm sân khấu Catwalk hoành tráng, giải đấu cosplay contest kịch tính và hàng trăm gian hàng phụ kiện độc quyền.',
          ticketPriceLabel: '120.000 VNĐ',
          ticketPriceAmount: 120000,
          isRecruiting: true,
          isFeaturedFestival: true,
          registrationCta: 'Đăng ký gian hàng / Khách mời',
          schedule: [
            { time: '08:30', activity: 'Mở cửa đón khách & Check-in' },
            { time: '10:00', activity: 'Khai mạc & Trình diễn mở màn' },
            { time: '14:00', activity: 'Chung kết Cosplay Runway Contest' },
            { time: '17:30', activity: 'Giao lưu ký tặng cùng Khách mời' },
            { time: '20:00', activity: 'Đại nhạc hội Anime Music & Bế mạc' },
          ],
          categories: ['Festival', 'Catwalk', 'Gian hàng', 'Contest'],
          filterTags: ['all', 'upcoming', 'recruiting', 'hcm'],
          status: EEventStatus.UPCOMING,
          participantsCount: 42,
          applicationsCount: 18,
          interestedCount: 1280,
        }),
      );

      await this.participantRepo.save([
        this.participantRepo.create({
          eventId: event1.id,
          userId: kirikoUser.id,
          name: 'KIRIKO',
          avatarUrl: '/landing/avatar-kiriko.jpg',
          isVerified: true,
          roleLabel: 'Guest Cosplayer',
          sortOrder: 1,
        }),
        this.participantRepo.create({
          eventId: event1.id,
          userId: sorikoUser.id,
          name: 'Soriko',
          avatarUrl: '/landing/avatar-soriko.jpg',
          isVerified: true,
          roleLabel: 'Gian hàng Handmade',
          sortOrder: 2,
        }),
      ]);

      await this.eventRepo.save([
        this.eventRepo.create({
          slug: 'winter-anime-cosplay-matsuri-hanoi',
          title: 'Winter Anime & Cosplay Matsuri',
          dayLabel: '20',
          monthLabel: 'Th12',
          yearLabel: '2026',
          dateString: '20/12/2026',
          startAt: new Date('2026-12-20T08:30:00Z'),
          endAt: new Date('2026-12-20T21:30:00Z'),
          locationLabel: 'Hà Nội',
          locationFilterCode: 'hanoi',
          venue: 'Cung Thể Thao Quần Ngựa, Ba Đình, Hà Nội',
          imageUrl: '/landing/cosplay-work-2.jpg',
          bannerImageUrl: '/landing/art-acheron.jpg',
          description:
            'Đại nhạc hội anime mùa đông, sàn diễn catwalk cosplay hoành tráng và chuyên nghiệp nhất miền Bắc.',
          ticketPriceLabel: '100.000 VNĐ',
          ticketPriceAmount: 100000,
          isRecruiting: true,
          isFeaturedFestival: true,
          registrationCta: 'Đăng ký biểu diễn sân khấu',
          schedule: [
            { time: '09:00', activity: 'Khai mạc hội chợ mùa đông' },
            { time: '14:30', activity: 'Cuộc thi Dance Cover J-Pop' },
            { time: '19:00', activity: 'Sàn diễn Runway Cosplay' },
          ],
          categories: ['Festival', 'Dance', 'Catwalk'],
          filterTags: ['all', 'upcoming', 'recruiting', 'hanoi'],
          status: EEventStatus.UPCOMING,
          participantsCount: 28,
          applicationsCount: 12,
          interestedCount: 890,
        }),
        this.eventRepo.create({
          slug: 'kosume-crafting-artist-market-tphcm',
          title: 'Kosume Crafting & Artist Market',
          dayLabel: '28',
          monthLabel: 'Th12',
          yearLabel: '2026',
          dateString: '28/12/2026',
          startAt: new Date('2026-12-28T09:00:00Z'),
          endAt: new Date('2026-12-28T18:00:00Z'),
          locationLabel: 'TP.HCM',
          locationFilterCode: 'hcm',
          venue: 'Nhà thi đấu Hồ Xuân Hương, Q.3, TP.HCM',
          imageUrl: '/landing/cosplay-work-3.jpg',
          bannerImageUrl: '/landing/art-kafka.jpg',
          description:
            'Không gian giao lưu, mua sắm phụ kiện cosplay, đạo cụ handmade và art print độc quyền từ các creator hàng đầu.',
          ticketPriceLabel: 'Miễn phí vào cổng',
          ticketPriceAmount: 0,
          isRecruiting: false,
          isFeaturedFestival: true,
          registrationCta: 'Đăng ký gian hàng Artist',
          categories: ['Market', 'Crafting', 'Handmade'],
          filterTags: ['all', 'upcoming', 'hcm'],
          status: EEventStatus.UPCOMING,
          participantsCount: 35,
          applicationsCount: 5,
          interestedCount: 650,
        }),
      ]);
    }

    // 7. Seed Posts & Media
    const postsCount = await this.postRepo.count();
    if (postsCount === 0) {
      const post1 = await this.postRepo.save(
        this.postRepo.create({
          slug: 'acheron-loi-than-khoi-nguyen',
          authorId: kirikoUser.id,
          title: 'Acheron - Lôi Thần Khởi Nguyên',
          caption:
            'Bộ ảnh tâm huyết thực hiện sau 3 tháng nghiên cứu trang phục và hiệu ứng visual kiếm khí. Cảm ơn ekip đã đồng hành cùng Kiriko!',
          postType: EPostType.PHOTOSET,
          albumCategory: EAlbumCategory.SERIES,
          albumCategoryLabel: 'Nhân vật & Series',
          characterName: 'Acheron',
          fandomName: 'Honkai: Star Rail',
          coverImageUrl: '/landing/art-acheron.jpg',
          isCollage: true,
          collagePreviewUrls: [
            '/landing/art-acheron.jpg',
            '/landing/art-raiden-1.jpg',
            '/landing/cosplay-work-1.jpg',
            '/landing/cosplay-work-2.jpg',
          ],
          tagNamesCache: ['HonkaiStarRail', 'Acheron', 'Photoset', 'CosplayVN'],
          isPublic: true,
          enableWatermark: false,
          status: EPostStatus.PUBLISHED,
          isFeaturedWork: true,
          photosCount: 4,
          likesCount: 3420,
          commentsCount: 156,
          savesCount: 890,
          trendingScore: 98.5,
          publishedAt: new Date(),
        }),
      );

      await this.mediaRepo.save([
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/art-acheron.jpg',
          sortOrder: 0,
          isCover: true,
          altText: 'Acheron portrait',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/art-raiden-1.jpg',
          sortOrder: 1,
          isCover: false,
          altText: 'Acheron pose with sword',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/cosplay-work-1.jpg',
          sortOrder: 2,
          isCover: false,
          altText: 'Acheron close-up eye detail',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/cosplay-work-2.jpg',
          sortOrder: 3,
          isCover: false,
          altText: 'Acheron back view landscape',
        }),
      ]);

      const post2 = await this.postRepo.save(
        this.postRepo.create({
          slug: 'kafka-hunter-stellarons',
          authorId: sorikoUser.id,
          title: 'Kafka - Hunter',
          caption:
            'Stellaron Hunter bí ẩn và quyến rũ. Trang phục may thủ công bởi Soriko Studio.',
          postType: EPostType.PHOTOSET,
          albumCategory: EAlbumCategory.SERIES,
          albumCategoryLabel: 'Nhân vật & Series',
          characterName: 'Kafka',
          fandomName: 'Honkai: Star Rail',
          coverImageUrl: '/landing/art-kafka.jpg',
          isCollage: false,
          collagePreviewUrls: [
            '/landing/art-kafka.jpg',
            '/landing/cosplay-work-3.jpg',
          ],
          tagNamesCache: ['HonkaiStarRail', 'Kafka', 'StellaronHunter'],
          isPublic: true,
          status: EPostStatus.PUBLISHED,
          isFeaturedWork: true,
          photosCount: 2,
          likesCount: 2890,
          commentsCount: 98,
          savesCount: 650,
          trendingScore: 91.2,
          publishedAt: new Date(),
        }),
      );

      await this.mediaRepo.save([
        this.mediaRepo.create({
          postId: post2.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/art-kafka.jpg',
          sortOrder: 0,
          isCover: true,
        }),
        this.mediaRepo.create({
          postId: post2.id,
          mediaType: EMediaType.IMAGE,
          url: '/landing/cosplay-work-3.jpg',
          sortOrder: 1,
          isCover: false,
        }),
      ]);

      // 8. Social interactions
      await this.postLikeRepo.save([
        this.postLikeRepo.create({ postId: post1.id, userId: haianhUser.id }),
        this.postLikeRepo.create({ postId: post2.id, userId: haianhUser.id }),
        this.postLikeRepo.create({ postId: post1.id, userId: sorikoUser.id }),
      ]);

      await this.followRepo.save([
        this.followRepo.create({
          followerId: haianhUser.id,
          followingId: kirikoUser.id,
        }),
        this.followRepo.create({
          followerId: haianhUser.id,
          followingId: sorikoUser.id,
        }),
        this.followRepo.create({
          followerId: sorikoUser.id,
          followingId: kirikoUser.id,
        }),
      ]);

      const comment1 = await this.commentRepo.save(
        this.commentRepo.create({
          postId: post1.id,
          authorId: haianhUser.id,
          content:
            'Thần thái quá chị ơi! Bộ phục trang này tự làm hay đặt may vậy ạ? 💖',
          likesCount: 5,
        }),
      );

      await this.commentRepo.save(
        this.commentRepo.create({
          postId: post1.id,
          authorId: kirikoUser.id,
          parentId: comment1.id,
          content:
            '@haianh_fan Cảm ơn em nhé! Bộ này phần giáp vai chị tự đúc resin 3D đó nha ^^',
          likesCount: 12,
        }),
      );

      // 9. Collections
      const collection = await this.collectionRepo.save(
        this.collectionRepo.create({
          userId: haianhUser.id,
          title: 'Thư mục "Idol"',
          slug: 'thu-muc-idol',
          description:
            'Tuyển tập các bộ ảnh cosplay đẹp mê hồn của idol Kiriko và Soriko.',
          isDefault: true,
          isPublic: true,
          itemsCount: 2,
          previewThumbnails: [
            '/landing/art-raiden-1.jpg',
            '/landing/art-kafka.jpg',
          ],
        }),
      );

      await this.collectionItemRepo.save([
        this.collectionItemRepo.create({
          collectionId: collection.id,
          postId: post1.id,
          sortOrder: 0,
        }),
        this.collectionItemRepo.create({
          collectionId: collection.id,
          postId: post2.id,
          sortOrder: 1,
        }),
      ]);
    }

    // 10. Seed Spotlight Banners
    const spotlightCount = await this.spotlightRepo.count();
    if (spotlightCount === 0) {
      await this.spotlightRepo.save([
        this.spotlightRepo.create({
          cosplayerUserId: kirikoUser.id,
          name: 'KIRIKO',
          isVerified: true,
          badge: 'Cosplayer Tiêu Điểm Tuần Này',
          tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
          bannerImageUrl: '/landing/hero-banner.png',
          portfolioHref: '/cosplayer/kiriko',
          bookingHref: '/cosplayer/kiriko#booking',
          sortOrder: 0,
          isActive: true,
        }),
        this.spotlightRepo.create({
          cosplayerUserId: kirikoUser.id,
          name: 'ACHERON',
          isVerified: true,
          badge: 'Cosplayer Nổi Bật Tháng Này',
          tagline: 'Khởi nguyên lôi thần - Thần thái và phục trang đỉnh cao',
          bannerImageUrl: '/landing/art-acheron.jpg',
          portfolioHref: '/cosplayer/kiriko',
          bookingHref: '/cosplayer/kiriko#booking-acheron',
          sortOrder: 1,
          isActive: true,
        }),
        this.spotlightRepo.create({
          cosplayerUserId: sorikoUser.id,
          name: 'KAFKA',
          isVerified: true,
          badge: 'Siêu Phẩm Hóa Thân 2026',
          tagline: 'Sát thủ thợ săn Stellaron - Quyến rũ và bí ẩn',
          bannerImageUrl: '/landing/art-kafka.jpg',
          portfolioHref: '/cosplayer/sorikocos',
          bookingHref: '/cosplayer/sorikocos#booking-kafka',
          sortOrder: 2,
          isActive: true,
        }),
      ]);
    }

    // 11. Seed Leaderboard Snapshots
    const lbCount = await this.leaderboardRepo.count();
    if (lbCount === 0) {
      const categories = [
        ERankingFilterCategory.WEEK,
        ERankingFilterCategory.MONTH,
        ERankingFilterCategory.ALL,
      ];

      for (const cat of categories) {
        await this.leaderboardRepo.save([
          this.leaderboardRepo.create({
            filterCategory: cat,
            periodKey: '2026-W46',
            isCurrent: true,
            rank: 1,
            previousRank: 1,
            trend: ERankingTrend.SAME,
            userId: kirikoUser.id,
            displayName: 'KIRIKO',
            handle: '@kirikocos',
            roleLabel: 'Model • Crafting',
            avatarUrl: '/landing/avatar-kiriko.jpg',
            isVerified: true,
            likesCount: 85200,
            followersCount: 12500,
            score: 98.5,
            featuredProjects: [
              '/landing/art-raiden-1.jpg',
              '/landing/art-acheron.jpg',
              '/landing/art-kafka.jpg',
            ],
            portfolioHref: '/cosplayer/kiriko',
          }),
          this.leaderboardRepo.create({
            filterCategory: cat,
            periodKey: '2026-W46',
            isCurrent: true,
            rank: 2,
            previousRank: 3,
            trend: ERankingTrend.UP,
            userId: sorikoUser.id,
            displayName: 'Soriko',
            handle: '@sorikocos',
            roleLabel: 'Costume Maker',
            avatarUrl: '/landing/avatar-soriko.jpg',
            isVerified: true,
            likesCount: 72400,
            followersCount: 9800,
            score: 94.2,
            featuredProjects: [
              '/landing/art-kafka.jpg',
              '/landing/cosplay-work-3.jpg',
            ],
            portfolioHref: '/cosplayer/sorikocos',
          }),
        ]);
      }
    }

    // 12. Seed Notifications
    const notifCount = await this.notificationRepo.count({
      where: { recipientUserId: haianhUser.id },
    });
    if (notifCount === 0) {
      await this.notificationRepo.save([
        this.notificationRepo.create({
          recipientUserId: haianhUser.id,
          category: ENotificationCategory.BOOKING,
          type: ENotificationType.BOOKING_REQUEST,
          actorUserId: kirikoUser.id,
          actorName: 'KIRIKO',
          actorAvatarUrl: '/landing/avatar-kiriko.jpg',
          actorRole: 'Pro Cosplayer',
          actorIsVerified: true,
          title: 'Yêu cầu Booking Cosplay mới',
          description:
            "KIRIKO vừa gửi cho bạn một lời mời tham gia dự án Photoset chủ đề 'Genshin Impact Inazuma Festival'.",
          actionUrl: '/jobs',
          actionLabel: 'Xem hợp đồng & Chi tiết',
          secondaryActionLabel: 'Từ chối',
          previewImageUrl: '/landing/art-raiden-1.jpg',
          isRead: false,
        }),
        this.notificationRepo.create({
          recipientUserId: haianhUser.id,
          category: ENotificationCategory.SOCIAL,
          type: ENotificationType.FOLLOW,
          actorUserId: sorikoUser.id,
          actorName: 'Soriko',
          actorAvatarUrl: '/landing/avatar-soriko.jpg',
          actorRole: 'Costume Maker',
          actorIsVerified: true,
          title: 'Người theo dõi mới',
          description: 'Soriko đã bắt đầu theo dõi hoạt động của bạn.',
          actionUrl: '/cosplayer/sorikocos',
          actionLabel: 'Theo dõi lại',
          isRead: false,
        }),
      ]);
    }

    this.logger.log('Kosume domain data seeded successfully!');
  }
}
