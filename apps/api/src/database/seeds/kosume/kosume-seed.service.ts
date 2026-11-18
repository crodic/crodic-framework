import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { FileEntity } from '../../../api/file/entities/file.entity';
import { FileFolderEntity } from '../../../api/file/entities/file-folder.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserEntity } from '../../../api/user/entities/user.entity';
import { UserAccountEntity } from '../../../api/user/entities/user-account.entity';
import { EUserRole } from '../../../api/user/constants/user.constant';
import { EAccountProvider } from '../../../common/constants/entity.enum';
import { CosplayerProfileEntity } from '../../../api/cosplayer/entities/cosplayer-profile.entity';
import { CosplayerCharacterEntity } from '../../../api/cosplayer/entities/cosplayer-character.entity';
import { PostEntity } from '../../../api/post/entities/post.entity';
import { PostMediaEntity } from '../../../api/post/entities/post-media.entity';
import { PostLikeEntity } from '../../../api/post/entities/post-like.entity';
import { PostCommentEntity } from '../../../api/post/entities/post-comment.entity';
import {
  EAlbumCategory,
  EMediaType,
  EPostCollaboratorRole,
  EPostStatus,
  EPostType,
} from '../../../api/post/constants/post.constant';
import { UserFollowEntity } from '../../../api/social/entities/user-follow.entity';
import { CollectionEntity } from '../../../api/collection/entities/collection.entity';
import { CollectionItemEntity } from '../../../api/collection/entities/collection-item.entity';
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
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    @InjectRepository(FileFolderEntity)
    private readonly folderRepo: Repository<FileFolderEntity>,
  ) {}

  private async seedKosumeFiles(): Promise<Record<string, string>> {
    this.logger.log('Seeding Kosume static files into media library...');

    let folder = await this.folderRepo.findOne({ where: { name: 'kosume' } });
    if (!folder) {
      folder = this.folderRepo.create({
        name: 'kosume',
        title: 'Kosume Platform',
        color: '#EC4899',
        depth: 0,
      });
      await this.folderRepo.save(folder);
    }

    const appUrl = (process.env.APP_URL ?? 'http://localhost:8001').replace(
      /\/+$/,
      '',
    );
    const localRoot = process.env.FILESYSTEM_LOCAL_ROOT ?? 'storage';
    const targetDir = path.resolve(
      process.cwd(),
      localRoot,
      'public',
      'uploads',
      'image',
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let sourceDir = path.resolve(__dirname, 'assets');
    if (!fs.existsSync(sourceDir)) {
      sourceDir = path.resolve(
        process.cwd(),
        'src',
        'database',
        'seeds',
        'kosume',
        'assets',
      );
    }

    const fileUrlMap: Record<string, string> = {};

    if (!fs.existsSync(sourceDir)) {
      this.logger.warn(`Source assets directory not found at ${sourceDir}`);
      return fileUrlMap;
    }

    const files = fs.readdirSync(sourceDir);
    for (const fileName of files) {
      const sourceFilePath = path.join(sourceDir, fileName);
      if (!fs.statSync(sourceFilePath).isFile()) continue;

      const ext = path.extname(fileName).slice(1);
      const nameWithoutExt = path.basename(fileName, `.${ext}`);
      const publicId = `kosume-${nameWithoutExt}`;
      const destFileName = `${publicId}.${ext}`;
      const destFilePath = path.join(targetDir, destFileName);

      const buffer = fs.readFileSync(sourceFilePath);
      fs.writeFileSync(destFilePath, buffer);

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      const size = buffer.length;

      let fileEntity = await this.fileRepo.findOne({
        where: { public_id: publicId },
      });
      if (!fileEntity) {
        fileEntity = this.fileRepo.create({
          public_id: publicId,
          folder: 'kosume',
          disk: 'public',
          visibility: 'public',
          original_name: fileName,
          path: `uploads/image/${destFileName}`,
          hash,
          mime,
          size,
          width: 1200,
          height: 800,
          duration: null,
          resource_type: 'image',
          status: 'active',
          is_starred: false,
        });
        await this.fileRepo.save(fileEntity);
      }

      const fileUrl = `${appUrl}/storage/uploads/image/${destFileName}`;
      fileUrlMap[fileName] = fileUrl;
    }

    // Update existing database entities if they still use legacy relative paths
    for (const [originalName, fileUrl] of Object.entries(fileUrlMap)) {
      const legacyPath = `/landing/${originalName}`;

      await this.spotlightRepo
        .createQueryBuilder()
        .update()
        .set({ bannerImageUrl: fileUrl })
        .where('bannerImageUrl = :legacyPath', { legacyPath })
        .execute();

      await this.eventRepo
        .createQueryBuilder()
        .update()
        .set({ imageUrl: fileUrl })
        .where('imageUrl = :legacyPath', { legacyPath })
        .execute();

      await this.eventRepo
        .createQueryBuilder()
        .update()
        .set({ bannerImageUrl: fileUrl })
        .where('bannerImageUrl = :legacyPath', { legacyPath })
        .execute();

      await this.postRepo
        .createQueryBuilder()
        .update()
        .set({ coverImageUrl: fileUrl })
        .where('coverImageUrl = :legacyPath', { legacyPath })
        .execute();

      await this.mediaRepo
        .createQueryBuilder()
        .update()
        .set({ url: fileUrl })
        .where('url = :legacyPath', { legacyPath })
        .execute();

      await this.profileRepo
        .createQueryBuilder()
        .update()
        .set({ avatarUrl: fileUrl })
        .where('avatarUrl = :legacyPath', { legacyPath })
        .execute();

      await this.profileRepo
        .createQueryBuilder()
        .update()
        .set({ coverUrl: fileUrl })
        .where('coverUrl = :legacyPath', { legacyPath })
        .execute();

      await this.userRepo
        .createQueryBuilder()
        .update()
        .set({ avatar: fileUrl })
        .where('avatar = :legacyPath', { legacyPath })
        .execute();
    }

    this.logger.log(
      `Seeded ${Object.keys(fileUrlMap).length} Kosume files successfully.`,
    );
    return fileUrlMap;
  }

  async run(): Promise<void> {
    this.logger.log('Seeding Kosume domain data...');
    const fileUrls = await this.seedKosumeFiles();
    const getUrl = (name: string, fallback: string) =>
      fileUrls[name] ?? fallback;

    // 1. Seed Users & Profiles
    const usersData = [
      {
        email: 'kiriko@kosume.com',
        username: 'kiriko',
        firstName: 'KIRIKO',
        lastName: 'Cosplayer',
        role: EUserRole.COSPLAYER,
        followersCount: 12500,
        followingCount: 18,
        collectionsCount: 6,
        avatar: getUrl(
          'avatar-kiriko.jpg',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        ),
        profile: {
          slug: 'kiriko',
          displayName: 'KIRIKO',
          roleBadge: 'Cosplayer Pro',
          tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
          bio: 'Tiểu sử ngắn nhân viên, xuất sắc, khoa vẽ cosplay nhóm.',
          artisticBio:
            'Chào mừng bạn đến với không gian nghệ thuật của Kiriko! Với hơn 5 năm gắn bó cùng nghệ thuật hóa thân Cosplay, Kiriko luôn hướng tới sự chỉn chu và cảm xúc trọn vẹn trong từng nhân vật. Từ phục trang, makeup đến thần thái biểu cảm, mỗi tác phẩm là một câu chuyện được kể bằng tất cả nhiệt huyết.',
          avatarUrl: getUrl(
            'avatar-kiriko.jpg',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          ),
          coverUrl: getUrl(
            'hero-banner.png',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
          ),
          locationLabel: 'HÀ NỘI, VN',
          workArea: 'Hà Nội & Toàn quốc',
          heightCm: 165,
          experienceYearsNum: 5,
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
          isCraftingCreator: true,
          totalLikesCount: 85200,
          albumsCount: 24,
          charactersCount: 12,
          rankingScore: 98.5,
        },
      },
      {
        email: 'soriko@kosume.com',
        username: 'sorikocos',
        firstName: 'Soriko',
        lastName: 'Studio',
        role: EUserRole.COSPLAYER,
        followersCount: 9800,
        followingCount: 35,
        collectionsCount: 4,
        avatar: getUrl(
          'avatar-soriko.jpg',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        ),
        profile: {
          slug: 'sorikocos',
          displayName: 'Soriko',
          roleBadge: 'Costume Maker • Cosplayer',
          tagline: 'Chuyên phục trang và đạo cụ cosplay thủ công tinh xảo',
          bio: 'Maker phục trang & Cosplayer tự do tại TP.HCM.',
          avatarUrl: getUrl(
            'avatar-soriko.jpg',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          ),
          coverUrl: getUrl(
            'hero-banner.png',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
          ),
          locationLabel: 'TP.HCM, VN',
          workArea: 'TP.HCM & Toàn quốc',
          heightCm: 162,
          experienceYearsNum: 4,
          skills: ['May phục trang cao cấp', 'Make-up', 'Tạo mẫu tóc Wig'],
          specialties: ['Honkai: Star Rail', 'Zenless Zone Zero'],
          contactEmail: 'soriko.studio@gmail.com',
          isVerified: true,
          isCraftingCreator: true,
          totalLikesCount: 72400,
          albumsCount: 16,
          charactersCount: 8,
          rankingScore: 94.2,
        },
      },
      {
        email: 'acheron.vn@kosume.com',
        username: 'acheron_vn',
        firstName: 'Acheron',
        lastName: 'VN',
        role: EUserRole.COSPLAYER,
        followersCount: 8400,
        followingCount: 22,
        collectionsCount: 2,
        avatar: getUrl(
          'avatar-acheron.jpg',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        ),
        profile: {
          slug: 'acheron_vn',
          displayName: 'Acheron_VN',
          roleBadge: 'Model • Crafting',
          tagline: 'Khởi nguyên lôi thần - Thần thái và phục trang đỉnh cao',
          bio: 'Chuyên phong cách visual mạnh mẽ và concept anime dark fantasy.',
          avatarUrl: getUrl(
            'avatar-acheron.jpg',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          ),
          coverUrl: getUrl(
            'hero-banner.png',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
          ),
          locationLabel: 'Đà Nẵng, VN',
          workArea: 'Toàn quốc',
          heightCm: 168,
          experienceYearsNum: 3,
          skills: ['Photoset Ngoại cảnh', 'Diễn xuất Action'],
          specialties: ['Honkai: Star Rail', 'NieR:Automata'],
          contactEmail: 'acheron.vn@gmail.com',
          isVerified: true,
          totalLikesCount: 65700,
          albumsCount: 12,
          charactersCount: 6,
          rankingScore: 89.1,
        },
      },
      {
        email: 'haianh.fan@gmail.com',
        username: 'haianh_fan',
        firstName: 'Hải',
        lastName: 'Anh',
        role: EUserRole.FAN,
        followersCount: 0,
        followingCount: 2,
        collectionsCount: 1,
        avatar: getUrl(
          'cosplay-work-6.jpg',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        ),
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
            followersCount: u.followersCount,
            followingCount: u.followingCount,
            collectionsCount: u.collectionsCount,
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
        user.followersCount = u.followersCount;
        user.followingCount = u.followingCount;
        user.collectionsCount = u.collectionsCount;
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

    // 2. Seed Characters for KIRIKO
    const charsCount = await this.charRepo.count({
      where: { userId: kirikoUser.id },
    });
    if (charsCount === 0) {
      await this.charRepo.save([
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Raiden Shogun',
          seriesName: 'Genshin Impact',
          coverImageUrl: getUrl(
            'art-raiden-1.jpg',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
          ),
          albumsCount: 6,
          photosCount: 42,
          sortOrder: 1,
        }),
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Acheron',
          seriesName: 'Honkai: Star Rail',
          coverImageUrl: getUrl(
            'art-acheron.jpg',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
          ),
          albumsCount: 8,
          photosCount: 56,
          sortOrder: 2,
        }),
        this.charRepo.create({
          userId: kirikoUser.id,
          characterName: 'Kafka',
          seriesName: 'Honkai: Star Rail',
          coverImageUrl: getUrl(
            'art-kafka.jpg',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          ),
          albumsCount: 5,
          photosCount: 35,
          sortOrder: 3,
        }),
      ]);
    }

    // 3. Seed Events
    const eventsCount = await this.eventRepo.count();
    if (eventsCount === 0) {
      const event1 = await this.eventRepo.save(
        this.eventRepo.create({
          slug: 'vietnam-cosplay-festival-2026',
          title: 'Vietnam Cosplay Festival 2026',
          startAt: new Date('2026-12-15T08:00:00Z'),
          endAt: new Date('2026-12-15T21:00:00Z'),
          locationLabel: 'TP.HCM',
          venue: 'SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7',
          imageUrl: getUrl(
            'cosplay-work-1.jpg',
            'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=1200&q=80',
          ),
          bannerImageUrl: getUrl(
            'hero-banner.png',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
          ),
          description:
            'Lễ hội Cosplay lớn nhất năm 2026 quy tụ hơn 500 creator, nghệ sĩ đạo cụ và khách mời quốc tế. Không gian trải nghiệm sân khấu Catwalk hoành tráng, giải đấu cosplay contest kịch tính và hàng trăm gian hàng phụ kiện độc quyền.',
          ticketPriceAmount: 120000,
          isRecruiting: true,
          isFeaturedFestival: true,
          schedule: [
            { time: '08:30', activity: 'Mở cửa đón khách & Check-in' },
            { time: '10:00', activity: 'Khai mạc & Trình diễn mở màn' },
            { time: '14:00', activity: 'Chung kết Cosplay Runway Contest' },
            { time: '17:30', activity: 'Giao lưu ký tặng cùng Khách mời' },
            { time: '20:00', activity: 'Đại nhạc hội Anime Music & Bế mạc' },
          ],
          categories: ['Festival', 'Catwalk', 'Gian hàng', 'Contest'],
          status: EEventStatus.UPCOMING,
          participantsCount: 42,
          applicationsCount: 18,
          interestedCount: 1280,
          organizerName: 'Kosume Events & Community',
        }),
      );

      await this.participantRepo.save([
        this.participantRepo.create({
          eventId: event1.id,
          userId: kirikoUser.id,
          roleLabel: 'Guest Cosplayer',
          sortOrder: 1,
        }),
        this.participantRepo.create({
          eventId: event1.id,
          userId: sorikoUser.id,
          roleLabel: 'Gian hàng Handmade',
          sortOrder: 2,
        }),
      ]);

      await this.eventRepo.save([
        this.eventRepo.create({
          slug: 'winter-anime-cosplay-matsuri-hanoi',
          title: 'Winter Anime & Cosplay Matsuri',
          startAt: new Date('2026-12-20T08:30:00Z'),
          endAt: new Date('2026-12-20T21:30:00Z'),
          locationLabel: 'Hà Nội',
          venue: 'Cung Thể Thao Quần Ngựa, Ba Đình, Hà Nội',
          imageUrl: getUrl(
            'cosplay-work-2.jpg',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
          ),
          bannerImageUrl: getUrl(
            'art-acheron.jpg',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
          ),
          description:
            'Đại nhạc hội anime mùa đông, sàn diễn catwalk cosplay hoành tráng và chuyên nghiệp nhất miền Bắc.',
          ticketPriceAmount: 100000,
          isRecruiting: true,
          isFeaturedFestival: true,
          schedule: [
            { time: '09:00', activity: 'Khai mạc hội chợ mùa đông' },
            { time: '14:30', activity: 'Cuộc thi Dance Cover J-Pop' },
            { time: '19:00', activity: 'Sàn diễn Runway Cosplay' },
          ],
          categories: ['Festival', 'Dance', 'Catwalk'],
          status: EEventStatus.UPCOMING,
          participantsCount: 28,
          applicationsCount: 12,
          interestedCount: 890,
          organizerName: 'Hanoi ACG Festival Committee',
        }),
        this.eventRepo.create({
          slug: 'kosume-crafting-artist-market-tphcm',
          title: 'Kosume Crafting & Artist Market',
          startAt: new Date('2026-12-28T09:00:00Z'),
          endAt: new Date('2026-12-28T18:00:00Z'),
          locationLabel: 'TP.HCM',
          venue: 'Nhà thi đấu Hồ Xuân Hương, Q.3, TP.HCM',
          imageUrl: getUrl(
            'cosplay-work-3.jpg',
            'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
          ),
          bannerImageUrl: getUrl(
            'art-kafka.jpg',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          ),
          description:
            'Không gian giao lưu, mua sắm phụ kiện cosplay, đạo cụ handmade và art print độc quyền từ các creator hàng đầu.',
          ticketPriceAmount: 0,
          isRecruiting: false,
          isFeaturedFestival: true,
          categories: ['Market', 'Crafting', 'Handmade'],
          status: EEventStatus.UPCOMING,
          participantsCount: 35,
          applicationsCount: 5,
          interestedCount: 650,
          organizerName: 'Kosume Crafting Guild',
        }),
      ]);
    }

    // 4. Seed Posts & Media
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
          characterName: 'Acheron',
          fandomName: 'Honkai: Star Rail',
          coverImageUrl: getUrl(
            'art-acheron.jpg',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
          ),
          collaborators: [
            { role: EPostCollaboratorRole.PHOTOGRAPHER, name: 'Neko Studio' },
            { role: EPostCollaboratorRole.MUA, name: 'Miko Makeup' },
          ],
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
          url: getUrl(
            'art-acheron.jpg',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 0,
          isCover: true,
          altText: 'Acheron portrait',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: getUrl(
            'art-raiden-1.jpg',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 1,
          isCover: false,
          altText: 'Acheron pose with sword',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: getUrl(
            'cosplay-work-1.jpg',
            'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 2,
          isCover: false,
          altText: 'Acheron close-up eye detail',
        }),
        this.mediaRepo.create({
          postId: post1.id,
          mediaType: EMediaType.IMAGE,
          url: getUrl(
            'cosplay-work-2.jpg',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
          ),
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
          characterName: 'Kafka',
          fandomName: 'Honkai: Star Rail',
          coverImageUrl: getUrl(
            'art-kafka.jpg',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          ),
          collaborators: [
            {
              role: EPostCollaboratorRole.PHOTOGRAPHER,
              name: 'Lumiere Visuals',
            },
            { role: EPostCollaboratorRole.PROP_MAKER, name: 'Soriko Studio' },
          ],
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
          url: getUrl(
            'art-kafka.jpg',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 0,
          isCover: true,
        }),
        this.mediaRepo.create({
          postId: post2.id,
          mediaType: EMediaType.IMAGE,
          url: getUrl(
            'cosplay-work-3.jpg',
            'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 1,
          isCover: false,
        }),
      ]);

      // 5. Social interactions
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

      // 6. Collections
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

    // 7. Seed Spotlight Banners
    const spotlightCount = await this.spotlightRepo.count();
    if (spotlightCount === 0) {
      await this.spotlightRepo.save([
        this.spotlightRepo.create({
          cosplayerUserId: kirikoUser.id,
          badge: 'Cosplayer Tiêu Điểm Tuần Này',
          tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
          bannerImageUrl: getUrl(
            'hero-banner.png',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
          ),
          sortOrder: 0,
          isActive: true,
        }),
        this.spotlightRepo.create({
          cosplayerUserId: kirikoUser.id,
          badge: 'Cosplayer Nổi Bật Tháng Này',
          tagline: 'Khởi nguyên lôi thần - Thần thái và phục trang đỉnh cao',
          bannerImageUrl: getUrl(
            'art-acheron.jpg',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 1,
          isActive: true,
        }),
        this.spotlightRepo.create({
          cosplayerUserId: sorikoUser.id,
          badge: 'Siêu Phẩm Hóa Thân 2026',
          tagline: 'Sát thủ thợ săn Stellaron - Quyến rũ và bí ẩn',
          bannerImageUrl: getUrl(
            'art-kafka.jpg',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          ),
          sortOrder: 2,
          isActive: true,
        }),
      ]);
    }

    // 8. Seed Leaderboard Snapshots
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
            likesCount: 85200,
            followersCount: 12500,
            score: 98.5,
            featuredProjects: [
              getUrl(
                'art-raiden-1.jpg',
                'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
              ),
              getUrl(
                'art-acheron.jpg',
                'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
              ),
              getUrl(
                'art-kafka.jpg',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              ),
            ],
          }),
          this.leaderboardRepo.create({
            filterCategory: cat,
            periodKey: '2026-W46',
            isCurrent: true,
            rank: 2,
            previousRank: 3,
            trend: ERankingTrend.UP,
            userId: sorikoUser.id,
            likesCount: 72400,
            followersCount: 9800,
            score: 94.2,
            featuredProjects: [
              getUrl(
                'art-kafka.jpg',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              ),
              getUrl(
                'cosplay-work-3.jpg',
                'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
              ),
            ],
          }),
        ]);
      }
    }

    // 9. Seed Notifications
    const notifCount = await this.notificationRepo.count({
      where: { recipientUserId: haianhUser.id },
    });
    if (notifCount === 0) {
      await this.notificationRepo.save([
        this.notificationRepo.create({
          recipientUserId: haianhUser.id,
          category: ENotificationCategory.SOCIAL,
          type: ENotificationType.LIKE,
          actorUserId: kirikoUser.id,
          title: 'KIRIKO đã phản hồi bình luận của bạn',
          description:
            "KIRIKO vừa nhắc đến bạn trong album 'Acheron - Lôi Thần Khởi Nguyên'.",
          actionUrl: '/posts/acheron-loi-than-khoi-nguyen',
          previewImageUrl: getUrl(
            'art-raiden-1.jpg',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
          ),
          isRead: false,
        }),
        this.notificationRepo.create({
          recipientUserId: haianhUser.id,
          category: ENotificationCategory.SOCIAL,
          type: ENotificationType.FOLLOW,
          actorUserId: sorikoUser.id,
          title: 'Người theo dõi mới',
          description: 'Soriko đã bắt đầu theo dõi hoạt động của bạn.',
          actionUrl: '/cosplayer/sorikocos',
          isRead: false,
        }),
      ]);
    }

    this.logger.log('Kosume domain data seeded successfully!');
  }
}
