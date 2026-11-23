import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import slugify from 'slugify';
import { AllConfigType } from '../../../config/config.type';
import { AutoIncrementID } from '../../../common/types/common.type';
import { EventEntity } from '../entities/event.entity';
import { EEventStatus } from '../constants/event.constant';
import { CityEntity } from '../../location/entities/city.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { PostMediaEntity } from '../../post/entities/post-media.entity';
import {
  EAlbumCategory,
  EMediaType,
  EPostStatus,
  EPostType,
} from '../../post/constants/post.constant';

export interface ICrawledEventItem {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  venue: string;
  locationLabel: string;
  ticketPriceAmount?: number | null;
  description: string;
  imageUrl?: string | null;
  categories?: string[];
  sourceUrl?: string | null;
}

export interface IAiCrawlResult {
  success: boolean;
  totalDiscovered: number;
  newEventsCreated: number;
  duplicateEventsSkipped: number;
  postCreated: boolean;
  createdEventTitles: string[];
  message: string;
}

@Injectable()
export class AiEventCrawlerService {
  private readonly logger = new Logger(AiEventCrawlerService.name);

  // High-quality fallback cosplay convention posters if crawled source does not provide one
  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  ];

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly dataSource: DataSource,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(CityEntity)
    private readonly cityRepo: Repository<CityEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  /**
   * Main entry point: searches the web using Gemini Flash with Google Search Grounding,
   * extracts structured event info, syncs into Kosume events database, and publishes news.
   */
  async crawlAndSyncEvents(): Promise<IAiCrawlResult> {
    const apiKey = this.configService.get('ai.geminiApiKey', { infer: true });
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not configured in .env. Skipping AI Cosplay Event crawl.',
      );
      return {
        success: false,
        totalDiscovered: 0,
        newEventsCreated: 0,
        duplicateEventsSkipped: 0,
        postCreated: false,
        createdEventTitles: [],
        message: 'GEMINI_API_KEY is missing in environment variables.',
      };
    }

    const preferredModel =
      this.configService.get('ai.geminiModel', { infer: true }) ||
      'gemini-3.8-flash';

    this.logger.log(
      `[AI Event Crawler] Starting cosplay event search using model ${preferredModel}...`,
    );

    // 1. Gather events via Gemini Flash + Google Search
    const rawEvents = await this.fetchEventsFromGemini(apiKey, preferredModel);
    if (!rawEvents || rawEvents.length === 0) {
      this.logger.log('[AI Event Crawler] No events discovered by Gemini.');
      return {
        success: true,
        totalDiscovered: 0,
        newEventsCreated: 0,
        duplicateEventsSkipped: 0,
        postCreated: false,
        createdEventTitles: [],
        message: 'No upcoming cosplay events found at this time.',
      };
    }

    this.logger.log(
      `[AI Event Crawler] Gemini discovered ${rawEvents.length} candidate events. Processing...`,
    );

    let createdCount = 0;
    let skippedCount = 0;
    const createdEvents: EventEntity[] = [];

    // 2. Iterate and persist events safely
    for (const item of rawEvents) {
      try {
        const isDuplicate = await this.checkIfEventExists(item);
        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        const savedEvent = await this.saveNewEvent(item);
        createdEvents.push(savedEvent);
        createdCount++;
      } catch (err: any) {
        this.logger.error(
          `[AI Event Crawler] Failed to create event "${item.title}": ${err.message}`,
          err.stack,
        );
      }
    }

    // 3. If new events were created, automatically publish a summary post on Kosume
    let postCreated = false;
    if (createdEvents.length > 0) {
      try {
        await this.publishNewsPost(createdEvents);
        postCreated = true;
      } catch (err: any) {
        this.logger.error(
          `[AI Event Crawler] Failed to publish news post: ${err.message}`,
          err.stack,
        );
      }
    }

    const summary = `Discovered ${rawEvents.length} events. Created ${createdCount} new events. Skipped ${skippedCount} duplicates. Post published: ${postCreated ? 'Yes' : 'No'}.`;
    this.logger.log(`[AI Event Crawler] ${summary}`);

    return {
      success: true,
      totalDiscovered: rawEvents.length,
      newEventsCreated: createdCount,
      duplicateEventsSkipped: skippedCount,
      postCreated,
      createdEventTitles: createdEvents.map((e) => e.title),
      message: summary,
    };
  }

  /**
   * Calls Google Gemini Flash API with Search Grounding enabled.
   * Supports automatic fallback across model names (e.g. gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash).
   */
  private async fetchEventsFromGemini(
    apiKey: string,
    preferredModel: string,
  ): Promise<ICrawledEventItem[]> {
    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
    });
    const candidateModels = [
      preferredModel,
      'gemini-3.8-flash',
      'gemini-3.8-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
    ].filter((val, idx, arr) => arr.indexOf(val) === idx);

    const prompt = `
Bạn là trợ lý AI thông minh chuyên săn tin sự kiện Cosplay, Anime/Manga Festival, Otaku Convention.
Hãy sử dụng công cụ Google Search để tìm kiếm các sự kiện Lễ hội Cosplay, Anime Festival, Comic Con, Manga Expo sắp diễn ra hoặc đang chuẩn bị tổ chức tại Việt Nam (TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Cần Thơ, Hải Phòng...) hoặc khu vực Châu Á gần nhất trong thời gian tới.

Yêu cầu định dạng:
Chỉ trả về DUY NHẤT một mảng JSON (JSON array), không kèm văn bản giải thích nào khác ở ngoài.
Mỗi phần tử trong mảng là một object có cấu trúc:
[
  {
    "title": "Tên sự kiện / lễ hội (ví dụ: Fes Cosplay Mùa Hè 2025)",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD hoặc null",
    "venue": "Địa điểm tổ chức cụ thể (ví dụ: Nhà Thi Đấu Nguyễn Du)",
    "locationLabel": "Tên tỉnh/thành phố (ví dụ: TP. Hồ Chí Minh)",
    "ticketPriceAmount": 100000, // Số tiền vé dự kiến (VNĐ), hoặc 0 nếu miễn phí vé, hoặc null nếu chưa công bố
    "description": "Mô tả chi tiết sự kiện: các hoạt động cosplay contest, dàn khách mời guest cosplayer, gian hàng, quy định trang phục...",
    "imageUrl": "Link ảnh poster chính thức nếu tìm được trên web, hoặc null",
    "categories": ["Cosplay", "Festival", "Anime", "Manga"],
    "sourceUrl": "Link fanpage hoặc nguồn tin gốc"
  }
]
`;

    let primaryError: Error | null = null;
    const errors: string[] = [];

    for (const modelName of candidateModels) {
      try {
        this.logger.debug(
          `[AI Event Crawler] Attempting generateContent with model: ${modelName}`,
        );

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || '';
        return this.parseJsonFromResponse(text);
      } catch (err: any) {
        if (!primaryError) {
          primaryError = err;
        }
        errors.push(`[${modelName}]: ${err.message}`);
        this.logger.warn(
          `[AI Event Crawler] Model ${modelName} failed: ${err.message}. Trying next candidate...`,
        );
      }
    }

    const failureSummary = `AI model request failed. Primary model (${preferredModel}): ${primaryError?.message || 'Unknown error'}`;
    throw new Error(failureSummary);
  }

  /**
   * Safely extracts JSON array from model output.
   */
  private parseJsonFromResponse(text: string): ICrawledEventItem[] {
    if (!text || !text.trim()) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      // Extract from ```json ... ``` code fence
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (fenceMatch && fenceMatch[1]) {
        try {
          return JSON.parse(fenceMatch[1]);
        } catch {
          // continue fallback
        }
      }

      // Extract array between first '[' and last ']'
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const rawJson = text.substring(startIdx, endIdx + 1);
        return JSON.parse(rawJson);
      }

      throw new Error(
        `Failed to extract valid JSON array from Gemini output: ${text.slice(0, 200)}...`,
      );
    }
  }

  /**
   * Checks if an event already exists in database (by title or slug similarity).
   */
  private async checkIfEventExists(item: ICrawledEventItem): Promise<boolean> {
    const slugCandidate = slugify(item.title, {
      lower: true,
      strict: true,
      locale: 'vi',
    });

    // 1. Check slug
    const countBySlug = await this.eventRepo.count({
      where: { slug: slugCandidate },
    });
    if (countBySlug > 0) return true;

    // 2. Check title exact or case-insensitive match
    const existing = await this.eventRepo
      .createQueryBuilder('event')
      .where('LOWER(event.title) = LOWER(:title)', {
        title: item.title.trim(),
      })
      .getOne();

    return !!existing;
  }

  /**
   * Resolves city ID and saves new event record.
   */
  private async saveNewEvent(item: ICrawledEventItem): Promise<EventEntity> {
    let slugCandidate = slugify(item.title, {
      lower: true,
      strict: true,
      locale: 'vi',
    });

    if (!slugCandidate) {
      slugCandidate = `cosplay-fes-${Date.now().toString(36)}`;
    }

    // Resolve City ID if location matches
    let cityId: AutoIncrementID | null = null;
    if (item.locationLabel) {
      const normalizedLoc = item.locationLabel.toLowerCase().trim();
      const city = await this.cityRepo
        .createQueryBuilder('c')
        .where('LOWER(c.name) LIKE :loc', { loc: `%${normalizedLoc}%` })
        .orWhere(":loc LIKE ('%' || LOWER(c.name) || '%')", {
          loc: normalizedLoc,
        })
        .getOne();

      if (city) {
        cityId = city.id;
      }
    }

    // Pick valid image URL or high-res cosplay fallback
    const imageUrl =
      item.imageUrl && item.imageUrl.startsWith('http')
        ? item.imageUrl
        : this.fallbackImages[
            Math.floor(Math.random() * this.fallbackImages.length)
          ];

    const startAt = item.startDate ? new Date(item.startDate) : new Date();
    const endAt = item.endDate ? new Date(item.endDate) : null;

    const newEvent = this.eventRepo.create({
      slug: slugCandidate,
      title: item.title,
      startAt,
      endAt,
      venue: item.venue || 'Đang cập nhật địa điểm',
      locationLabel: item.locationLabel || 'Việt Nam',
      cityId,
      imageUrl,
      bannerImageUrl: imageUrl,
      description:
        item.description ||
        `Sự kiện cosplay ${item.title}. Hãy chuẩn bị trang phục và tham gia cùng cộng đồng Kosume!`,
      ticketPriceAmount:
        typeof item.ticketPriceAmount === 'number' &&
        item.ticketPriceAmount >= 0
          ? item.ticketPriceAmount
          : null,
      isRecruiting: true, // Cosplayers can RSVP and apply
      isFeaturedFestival: false,
      schedule: [],
      categories: item.categories || ['Cosplay', 'Festival', 'Anime'],
      status: EEventStatus.UPCOMING,
      participantsCount: 0,
      applicationsCount: 0,
      interestedCount: 0,
    });

    return await this.eventRepo.save(newEvent);
  }

  /**
   * Publishes an announcement post to Kosume news feed summarizing new events.
   */
  private async publishNewsPost(events: EventEntity[]): Promise<void> {
    // Find an author for official announcements (first admin or system user)
    const author = await this.userRepo.findOne({
      order: { id: 'ASC' },
    });

    if (!author) {
      this.logger.warn(
        '[AI Event Crawler] No author user found to publish news post.',
      );
      return;
    }

    const eventListText = events
      .map(
        (e) =>
          `✨ **${e.title}**\n📅 Thời gian: ${e.startAt.toLocaleDateString('vi-VN')}\n📍 Địa điểm: ${e.venue} (${e.locationLabel})\n🎟️ Vé: ${e.ticketPriceAmount ? `${e.ticketPriceAmount.toLocaleString('vi-VN')} đ` : 'Miễn phí / Chưa công bố'}\n📝 ${e.description.slice(0, 200)}...`,
      )
      .join('\n\n');

    const caption = `🎉 **[Kosume AI Radar] Điểm tin sự kiện Cosplay mới nhất!**\n\nHôm nay Kosume đã tổng hợp được ${events.length} sự kiện cosplay & anime festival mới sắp diễn ra:\n\n${eventListText}\n\n👉 Các bạn cosplayer hãy xem chi tiết và đăng ký tham gia ngay trên Kosume nhé!`;

    const title = `[Điểm tin] Cập nhật ${events.length} sự kiện Cosplay mới nhất`;
    const slugBase = slugify(`diem-tin-cosplay-${Date.now().toString(36)}`, {
      lower: true,
      strict: true,
    });

    const coverImageUrl = events[0]?.imageUrl || this.fallbackImages[0];

    await this.dataSource.transaction(async (em) => {
      const post = em.create(PostEntity, {
        authorId: author.id,
        slug: slugBase,
        title,
        caption,
        postType: EPostType.PHOTOSET,
        albumCategory: EAlbumCategory.GENERAL,
        coverImageUrl,
        isPublic: true,
        enableWatermark: false,
        status: EPostStatus.PUBLISHED,
        photosCount: 1,
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        trendingScore: 0,
      });

      const savedPost = await em.save(PostEntity, post);

      const media = em.create(PostMediaEntity, {
        postId: savedPost.id,
        url: coverImageUrl,
        mediaType: EMediaType.IMAGE,
        sortOrder: 0,
      });

      await em.save(PostMediaEntity, media);
    });

    this.logger.log(`[AI Event Crawler] Published news post: "${title}"`);
  }
}
