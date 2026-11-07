import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ETagAliasType,
  ETagCategory,
  ETaggableEntityType,
  ETagRelationType,
  ETagSafetyRating,
  ETagStatus,
} from '../../../api/tag/constants/tag.constant';
import { CreateTagReqDto } from '../../../api/tag/dto/tag-req.dto';
import { TagEntity } from '../../../api/tag/entities/tag.entity';
import { EntityTaggingService } from '../../../api/tag/services/entity-tagging.service';
import { TagEncyclopediaService } from '../../../api/tag/services/tag-encyclopedia.service';
import { TagHierarchyService } from '../../../api/tag/services/tag-hierarchy.service';
import { TagService } from '../../../api/tag/services/tag.service';
import { AutoIncrementID } from '../../../common/types/common.type';

@Injectable()
export class TagSeedService {
  private readonly logger = new Logger(TagSeedService.name);

  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly tagService: TagService,
    private readonly hierarchyService: TagHierarchyService,
    private readonly encyclopediaService: TagEncyclopediaService,
    private readonly entityTaggingService: EntityTaggingService,
  ) {}

  async run(): Promise<void> {
    const seedDefinitions: CreateTagReqDto[] = [
      {
        name: 'Original',
        slug: 'original',
        category: ETagCategory.SYSTEM,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        isSystem: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Original Creation',
            shortSummary:
              'Original characters, worlds, and illustrations created independently without external IP.',
          },
          {
            locale: 'vi',
            translatedName: 'Tác phẩm gốc (Original)',
            shortSummary:
              'Nhân vật, bối cảnh và minh hoạ sáng tác độc lập không thuộc thương hiệu có sẵn.',
          },
          {
            locale: 'jp',
            translatedName: 'オリジナル',
            shortSummary:
              '既存の版権作品に基づかない一次創作イラスト・キャラクター作品。',
          },
        ],
        aliases: [
          { aliasName: 'OC', aliasType: ETagAliasType.ABBREVIATION },
          {
            aliasName: 'オリジナル作品',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'jp',
          },
          {
            aliasName: 'Tac pham goc',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'vi',
          },
        ],
      },
      {
        name: 'AI-Generated',
        slug: 'ai-generated',
        category: ETagCategory.SYSTEM,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        isSystem: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'AI-Generated',
            shortSummary:
              'System taxonomy marker for works produced wholly or partially with generative AI models.',
          },
          {
            locale: 'vi',
            translatedName: 'Tạo bởi AI',
            shortSummary:
              'Thẻ hệ thống phân loại nội dung sử dụng mô hình AI tạo sinh (dùng được với bộ lọc ẩn NG).',
          },
          {
            locale: 'jp',
            translatedName: 'AI生成',
            shortSummary:
              '画像生成AI等を用いて制作された作品を示すシステムタグ。',
          },
        ],
        aliases: [
          {
            aliasName: 'AIイラスト',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'jp',
          },
          {
            aliasName: 'ai_art',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'Fantasy',
        slug: 'fantasy',
        category: ETagCategory.GENERAL,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Fantasy',
            shortSummary:
              'Mythical realms, magic systems, medieval adventures, and supernatural folklore.',
          },
          {
            locale: 'vi',
            translatedName: 'Kỳ ảo (Fantasy)',
            shortSummary:
              'Thế giới phép thuật, thần thoại, phiêu lưu giả tưởng và sinh vật huyền bí.',
          },
          {
            locale: 'jp',
            translatedName: 'ファンタジー',
            shortSummary: '魔法や剣、架空の世界観を描いた幻想的な作品群。',
          },
        ],
        aliases: [
          {
            aliasName: 'High Fantasy',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
          {
            aliasName: 'The gioi phep thuat',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'vi',
          },
        ],
      },
      {
        name: '葬送のフリーレン',
        slug: 'frieren-beyond-journeys-end',
        category: ETagCategory.COPYRIGHT,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: "Frieren: Beyond Journey's End",
            shortSummary:
              'Acclaimed fantasy series following elven mage Frieren after the defeat of the Demon King.',
          },
          {
            locale: 'vi',
            translatedName: 'Pháp sư tiễn táng Frieren',
            shortSummary:
              'Bộ truyện kỳ ảo nổi tiếng xoay quanh hành trình thấu hiểu con người của pháp sư tộc tiên Frieren.',
          },
          {
            locale: 'jp',
            translatedName: '葬送のフリーレン',
            shortSummary:
              '魔王討伐後の世界を舞台にした山田鐘人・アベツカサによるファンタジー作品。',
          },
        ],
        aliases: [
          {
            aliasName: 'Sousou no Frieren',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
          {
            aliasName: 'Frieren Series',
            aliasType: ETagAliasType.ABBREVIATION,
            locale: 'en',
          },
        ],
      },
      {
        name: 'フリーレン',
        slug: 'frieren-character',
        category: ETagCategory.CHARACTER,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Frieren (Character)',
            shortSummary:
              'Thousand-year-old elven mage of the Hero Party who collects folk spells across the continent.',
          },
          {
            locale: 'vi',
            translatedName: 'Frieren (Nhân vật)',
            shortSummary:
              'Nữ pháp sư tộc Elf sống hơn ngàn năm của Tổ đội Dũng giả với niềm đam mê sưu tầm ma thuật dân gian.',
          },
          {
            locale: 'jp',
            translatedName: 'フリーレン',
            shortSummary:
              '『葬送のフリーレン』の主人公である長命なエルフの魔法使い。',
          },
        ],
        aliases: [
          {
            aliasName: 'Frieren',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
          {
            aliasName: 'Slayer Frieren',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'フェルン',
        slug: 'fern',
        category: ETagCategory.CHARACTER,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Fern',
            shortSummary:
              'First-class human mage and apprentice traveling alongside Frieren.',
          },
          {
            locale: 'vi',
            translatedName: 'Fern',
            shortSummary:
              'Pháp sư cấp một người phàm và là đệ tử đồng hành cùng Frieren.',
          },
          {
            locale: 'jp',
            translatedName: 'フェルン',
            shortSummary:
              'フリーレンの弟子として共に旅をする一級魔法使いの少女。',
          },
        ],
        aliases: [
          {
            aliasName: 'Fern Mage',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'Fate/Grand Order',
        slug: 'fate-grand-order',
        category: ETagCategory.COPYRIGHT,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Fate/Grand Order',
            shortSummary:
              'TYPE-MOON flagship RPG featuring Heroic Spirits across human history.',
          },
          {
            locale: 'vi',
            translatedName: 'Fate/Grand Order',
            shortSummary:
              'Tựa game nhập vai nổi tiếng của TYPE-MOON quy tụ các Anh Linh xuyên suốt lịch sử nhân loại.',
          },
          {
            locale: 'jp',
            translatedName: 'Fate/Grand Order',
            shortSummary: 'TYPE-MOONによるスマートフォン向けFateシリーズRPG。',
          },
        ],
        aliases: [
          { aliasName: 'FGO', aliasType: ETagAliasType.ABBREVIATION },
          {
            aliasName: 'フェイトグランドオーダー',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'jp',
          },
        ],
      },
      {
        name: 'アルトリア・ペンドラゴン',
        slug: 'artoria-pendragon',
        category: ETagCategory.CHARACTER,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Artoria Pendragon (Saber)',
            shortSummary:
              'King of Knights wielding Excalibur across the Fate universe.',
          },
          {
            locale: 'vi',
            translatedName: 'Artoria Pendragon (Saber)',
            shortSummary:
              'Vua Hiệp Sĩ cầm thanh thánh kiếm Excalibur biểu tượng của vũ trụ Fate.',
          },
          {
            locale: 'jp',
            translatedName: 'アルトリア・ペンドラゴン',
            shortSummary: 'Fateシリーズを象徴する騎士王セイバー。',
          },
        ],
        aliases: [
          { aliasName: 'Saber', aliasType: ETagAliasType.SYNONYM },
          { aliasName: 'Altria', aliasType: ETagAliasType.TYPO, locale: 'en' },
        ],
      },
      {
        name: 'Sci-Fi',
        slug: 'sci-fi',
        category: ETagCategory.GENERAL,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Science Fiction',
            shortSummary:
              'Speculative technology, space exploration, mecha, and futuristic civilizations.',
          },
          {
            locale: 'vi',
            translatedName: 'Khoa học viễn tưởng (Sci-Fi)',
            shortSummary:
              'Công nghệ tương lai, du hành vũ trụ, mecha và các nền văn minh viễn tưởng.',
          },
          {
            locale: 'jp',
            translatedName: 'SF',
            shortSummary:
              '未来技術、宇宙、メカニックなどを扱うサイエンス・フィクション作品。',
          },
        ],
        aliases: [
          {
            aliasName: 'SciFi',
            aliasType: ETagAliasType.ABBREVIATION,
            locale: 'en',
          },
          {
            aliasName: 'Science Fiction',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'Cyberpunk',
        slug: 'cyberpunk',
        category: ETagCategory.GENERAL,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Cyberpunk',
            shortSummary:
              'High-tech, neon-lit megacities, cybernetic augmentation, and dystopian digital culture.',
          },
          {
            locale: 'vi',
            translatedName: 'Cyberpunk (Viễn tưởng mạng)',
            shortSummary:
              'Siêu đô thị ánh đèn neon, cấy ghép cơ khí sinh học và bối cảnh công nghệ cao phản địa đàng.',
          },
          {
            locale: 'jp',
            translatedName: 'サイバーパンク',
            shortSummary:
              'ネオン輝く巨大都市や義体化・電脳空間を描く近未来SFジャンル。',
          },
        ],
        aliases: [
          {
            aliasName: 'Cyber Punk',
            aliasType: ETagAliasType.TYPO,
            locale: 'en',
          },
          {
            aliasName: 'Neon City',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'Landscape',
        slug: 'landscape',
        category: ETagCategory.GENERAL,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Landscape & Scenery',
            shortSummary:
              'Atmospheric environmental vistas, architectural backgrounds, and natural scenery.',
          },
          {
            locale: 'vi',
            translatedName: 'Phong cảnh & Bối cảnh',
            shortSummary:
              'Tranh vẽ thiên nhiên, kiến trúc không gian và bối cảnh giàu chiều sâu ánh sáng.',
          },
          {
            locale: 'jp',
            translatedName: '風景',
            shortSummary:
              '自然や都市建築など情景・背景美術を中心に描いた作品。',
          },
        ],
        aliases: [
          {
            aliasName: 'Scenery',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
          { aliasName: '背景', aliasType: ETagAliasType.SYNONYM, locale: 'jp' },
          {
            aliasName: 'Phong canh',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'vi',
          },
        ],
      },
      {
        name: 'Digital Illustration',
        slug: 'digital-illustration',
        category: ETagCategory.META,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Digital Illustration',
            shortSummary:
              'Illustrations painted with digital brushes, color grading, and layered workflows.',
          },
          {
            locale: 'vi',
            translatedName: 'Minh hoạ kỹ thuật số',
            shortSummary:
              'Tác phẩm hội hoạ kỹ thuật số sử dụng bảng vẽ và quy trình phối sáng hiện đại.',
          },
          {
            locale: 'jp',
            translatedName: 'デジタルイラスト',
            shortSummary:
              'ペイントソフトとペンタブレット等で制作されたデジタル絵画。',
          },
        ],
        aliases: [
          {
            aliasName: 'Digital Art',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
          {
            aliasName: 'CGイラスト',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'jp',
          },
        ],
      },
      {
        name: 'Concept Art',
        slug: 'concept-art',
        category: ETagCategory.META,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Concept Art',
            shortSummary:
              'Visual worldbuilding, prop sheets, and keyframe design for games, animation, and film.',
          },
          {
            locale: 'vi',
            translatedName: 'Concept Art (Thiết kế ý tưởng)',
            shortSummary:
              'Thiết kế thế giới quan, bối cảnh và nhân vật tiền kỳ cho game, hoạt hình và điện ảnh.',
          },
          {
            locale: 'jp',
            translatedName: 'コンセプトアート',
            shortSummary:
              'ゲームや映像作品の世界観・美術設定を視覚化するデザイン画。',
          },
        ],
        aliases: [
          {
            aliasName: 'Worldbuilding Art',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'en',
          },
        ],
      },
      {
        name: 'Mika Pikazo',
        slug: 'mika-pikazo',
        category: ETagCategory.ARTIST,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: true,
        translations: [
          {
            locale: 'en',
            translatedName: 'Mika Pikazo',
            shortSummary:
              'Renowned Japanese illustrator celebrated for vibrant chromatic pop palettes and character design.',
          },
          {
            locale: 'vi',
            translatedName: 'Mika Pikazo',
            shortSummary:
              'Hoạ sĩ minh hoạ Nhật Bản nổi tiếng với bảng màu rực rỡ giàu năng lượng và thiết kế nhân vật.',
          },
          {
            locale: 'jp',
            translatedName: 'Mika Pikazo',
            shortSummary:
              '鮮やかな色彩設計とキャラクターデザインで知られるイラストレーター。',
          },
        ],
        aliases: [
          {
            aliasName: 'ミカピカゾ',
            aliasType: ETagAliasType.SYNONYM,
            locale: 'jp',
          },
        ],
      },
    ];

    const bySlug = new Map<string, AutoIncrementID>();

    for (const def of seedDefinitions) {
      const existing = await this.tagRepository.findOne({
        where: { slug: def.slug },
      });
      if (existing) {
        bySlug.set(existing.slug, existing.id);
        continue;
      }
      const created = await this.tagService.create(def);
      bySlug.set(created.slug, created.id);
    }

    // Link Semantic DAG Hierarchy + Related + Disambiguation edges idempotently
    const linkSafe = async (
      srcSlug: string,
      dstSlug: string,
      type: ETagRelationType,
    ) => {
      const sId = bySlug.get(srcSlug);
      const dId = bySlug.get(dstSlug);
      if (!sId || !dId) return;
      await this.hierarchyService.addRelation(sId, dId, type).catch(() => null);
    };

    await linkSafe(
      'fantasy',
      'frieren-beyond-journeys-end',
      ETagRelationType.HIERARCHY,
    );
    await linkSafe(
      'frieren-beyond-journeys-end',
      'frieren-character',
      ETagRelationType.HIERARCHY,
    );
    await linkSafe(
      'frieren-beyond-journeys-end',
      'fern',
      ETagRelationType.HIERARCHY,
    );

    await linkSafe('fantasy', 'fate-grand-order', ETagRelationType.HIERARCHY);
    await linkSafe(
      'fate-grand-order',
      'artoria-pendragon',
      ETagRelationType.HIERARCHY,
    );

    await linkSafe('sci-fi', 'cyberpunk', ETagRelationType.HIERARCHY);
    await linkSafe(
      'digital-illustration',
      'concept-art',
      ETagRelationType.HIERARCHY,
    );
    await linkSafe(
      'digital-illustration',
      'landscape',
      ETagRelationType.HIERARCHY,
    );

    await linkSafe('cyberpunk', 'concept-art', ETagRelationType.RELATED);
    await linkSafe('landscape', 'fantasy', ETagRelationType.RELATED);

    // Classic Pixiv Disambiguation between series tag and eponymous character tag
    await linkSafe(
      'frieren-beyond-journeys-end',
      'frieren-character',
      ETagRelationType.DISAMBIGUATION,
    );
    await linkSafe(
      'frieren-character',
      'frieren-beyond-journeys-end',
      ETagRelationType.DISAMBIGUATION,
    );

    // Seed Pixiv Encyclopedia (dic) Wiki Articles in EN, VI, JP
    const wikiSeeds: {
      slug: string;
      locale: string;
      summary: string;
      body: string;
      isEditLocked?: boolean;
    }[] = [
      {
        slug: 'frieren-beyond-journeys-end',
        locale: 'en',
        summary:
          "Frieren: Beyond Journey's End (葬送のフリーレン) is a Japanese fantasy manga and anime series exploring time, memory, and companionship after the Demon King's defeat.",
        body: `
          <h2>Overview</h2>
          <p><strong>Frieren: Beyond Journey's End</strong> follows the elven mage <em>Frieren</em> decades after her ten-year adventure with Hero Himmel, Priest Heiter, and Warrior Eisen.</p>
          <h2>Tagging Conventions (Pixiv Standard)</h2>
          <ul>
            <li>Use <code>#葬送のフリーレン</code> as the parent copyright series tag.</li>
            <li>Pair with character child tags such as <code>#フリーレン</code> or <code>#フェルン</code> for character-focused works.</li>
            <li>Closure table expansion automatically surfaces <code>#フリーレン</code> and <code>#フェルン</code> works when browsing <code>#葬送のフリーレン</code>.</li>
          </ul>
        `,
      },
      {
        slug: 'frieren-beyond-journeys-end',
        locale: 'vi',
        summary:
          'Pháp sư tiễn táng Frieren (葬送のフリーレン) là tác phẩm kỳ ảo kể về hành trình chiêm nghiệm thời gian và ký ức của nữ pháp sư tộc Elf sau khi đánh bại Ma Vương.',
        body: `
          <h2>Giới thiệu chung</h2>
          <p><strong>Pháp sư tiễn táng Frieren</strong> mở đầu tại thời điểm Tổ đội Dũng giả chiến thắng trở về, nơi tuổi thọ ngàn năm của Frieren đối lập sâu sắc với đời người hữu hạn.</p>
          <h2>Quy tắc gắn Tag chuẩn Pixiv</h2>
          <ul>
            <li>Sử dụng <code>#葬送のフリーレン</code> làm thẻ tác phẩm gốc (Copyright).</li>
            <li>Kết hợp cùng các thẻ nhân vật con như <code>#フリーレン</code> hoặc <code>#フェルン</code>.</li>
            <li>Nhờ bảng bao đóng DAG (Closure Table), khi tìm kiếm <code>#Fantasy</code> hoặc <code>#葬送のフリーレン</code>, hệ thống tự động bao hàm toàn bộ các nhánh thẻ con.</li>
          </ul>
        `,
      },
      {
        slug: 'frieren-beyond-journeys-end',
        locale: 'jp',
        summary:
          '『葬送のフリーレン』は、魔王討伐後の世界を旅する長命なエルフの魔法使いフリーレンを描いたファンタジー作品。',
        body: `
          <h2>概要</h2>
          <p><strong>葬送のフリーレン</strong>は、勇者ヒンメル一行による魔王討伐の「その後」から物語が始まる後日譚ファンタジーである。</p>
          <h2>ピクシブにおけるタグ運用規約</h2>
          <ul>
            <li>作品タグとして <code>#葬送のフリーレン</code> を付与し、登場人物には <code>#フリーレン</code>・<code>#フェルン</code> 等の子タグを併用する。</li>
            <li>階層閉包テーブル（Closure Table）により、親タグ検索時にも子タグ作品が網羅的にヒットする。</li>
          </ul>
        `,
      },
      {
        slug: 'cyberpunk',
        locale: 'en',
        summary:
          'Cyberpunk is a subgenre of science fiction juxtaposing hyper-advanced cybernetics and neon megacities against gritty urban life.',
        body: `
          <h2>Visual Motifs</h2>
          <p>Works tagged with <strong>#Cyberpunk</strong> frequently feature rain-slicked streets, holographic signage, neural interfaces, and high-contrast cyan/magenta lighting.</p>
          <h2>Taxonomy Position</h2>
          <p>Child node under <code>#Sci-Fi</code> and associatively linked to <code>#Concept Art</code>.</p>
        `,
      },
      {
        slug: 'cyberpunk',
        locale: 'vi',
        summary:
          'Cyberpunk là nhánh con của Khoa học viễn tưởng (Sci-Fi) khắc hoạ siêu đô thị rực ánh đèn neon, công nghệ cấy ghép thần kinh và tương phản xã hội sắc nét.',
        body: `
          <h2>Đặc trưng thị giác</h2>
          <p>Các tác phẩm gắn thẻ <strong>#Cyberpunk</strong> thường nổi bật với kiến trúc tầng lớp khổng lồ, biển hiệu hologram trong mưa đêm và cơ khí sinh học.</p>
          <h2>Vị trí trong cây DAG</h2>
          <p>Là thẻ con trực tiếp của <code>#Sci-Fi</code>; khi người dùng tìm kiếm <code>#Sci-Fi</code> có bật mở rộng phân cấp, toàn bộ tác phẩm <code>#Cyberpunk</code> sẽ được tìm thấy tự động.</p>
        `,
      },
      {
        slug: 'original',
        locale: 'en',
        summary:
          'Protected system tag designating wholly original characters, lore, and illustrations created by the artist.',
        body: `
          <h2>Usage Policy</h2>
          <p>Attach <strong>#Original</strong> (or type its alias <code>OC</code>) when the work is not derived from an existing third-party franchise.</p>
        `,
        isEditLocked: true,
      },
    ];

    const seedActor = {
      adminId: null,
      userId: null,
    };

    for (const item of wikiSeeds) {
      const tagId = bySlug.get(item.slug);
      if (!tagId) continue;
      const existingWiki = await this.encyclopediaService.findByTagIdAndLocale(
        tagId,
        item.locale,
      );
      if (!existingWiki) {
        const createdWiki = await this.encyclopediaService.upsert(
          tagId,
          {
            locale: item.locale,
            summary: item.summary,
            body: item.body,
            isEditLocked: item.isEditLocked ?? false,
            changeNote: 'Initial Pixiv Encyclopedia seed revision',
          },
          seedActor,
        );
        if (item.isEditLocked && !seedActor.adminId) {
          await this.tagRepository.manager.query(
            `UPDATE tag_encyclopedias SET is_edit_locked = true WHERE id = $1`,
            [createdWiki.id],
          );
        }
      }
    }

    // Seed Sample Collaborative Folksonomy Tag Bars on Standalone Artwork Slots (#1, #2, #3)
    const sampleArtwork1 = await this.entityTaggingService.listEntityTags(
      ETaggableEntityType.ARTWORK,
      '1' as AutoIncrementID,
    );
    if (sampleArtwork1.tags.length === 0) {
      await this.entityTaggingService.syncAuthorTags(
        ETaggableEntityType.ARTWORK,
        '1' as AutoIncrementID,
        {
          tagNames: [
            '葬送のフリーレン',
            'フリーレン',
            'フェルン',
            'Landscape',
            'Digital Illustration',
          ],
          tagEditLocked: false,
        },
        seedActor,
      );
    }

    const sampleArtwork2 = await this.entityTaggingService.listEntityTags(
      ETaggableEntityType.ARTWORK,
      '2' as AutoIncrementID,
    );
    if (sampleArtwork2.tags.length === 0) {
      await this.entityTaggingService.syncAuthorTags(
        ETaggableEntityType.ARTWORK,
        '2' as AutoIncrementID,
        {
          tagNames: ['Original', 'Cyberpunk', 'Concept Art', 'Mika Pikazo'],
          tagEditLocked: false,
        },
        seedActor,
      );
    }

    const sampleArtwork3 = await this.entityTaggingService.listEntityTags(
      ETaggableEntityType.ARTWORK,
      '3' as AutoIncrementID,
    );
    if (sampleArtwork3.tags.length === 0) {
      await this.entityTaggingService.syncAuthorTags(
        ETaggableEntityType.ARTWORK,
        '3' as AutoIncrementID,
        {
          tagNames: ['FGO', 'Saber', 'Digital Illustration'],
          tagEditLocked: false,
        },
        seedActor,
      );
    }

    // Refresh trending scores so Trending Strip is populated out-of-the-box
    const allSeeded = await this.tagRepository.find({
      where: { status: ETagStatus.ACTIVE },
    });
    for (const tag of allSeeded) {
      if (tag.trendingScore === 0) {
        const baseScore = tag.usageCount * 12.5 + (tag.isOfficial ? 18 : 5);
        await this.tagRepository.update(
          { id: tag.id },
          {
            usageCount: Math.max(tag.usageCount, 1),
            trendingScore: Number(baseScore.toFixed(1)),
          },
        );
      }
    }

    this.logger.log(
      `Pixiv Tag System seeded successfully (${bySlug.size} canonical tags, DAG closures, encyclopedias, and sample artwork tag bars).`,
    );
  }
}
