import { BadRequestException } from '@nestjs/common';
import { TagNormalizationService } from './tag-normalization.service';

describe('TagNormalizationService', () => {
  let service: TagNormalizationService;

  beforeEach(() => {
    service = new TagNormalizationService();
  });

  describe('normalizeDisplayName', () => {
    it('applies NFKC width folding and strips leading hash symbols', () => {
      expect(service.normalizeDisplayName('  ###ＦＧＯ　イラスト  ')).toBe(
        'FGO イラスト',
      );
    });

    it('rejects empty or whitespace-only tag names', () => {
      expect(() => service.normalizeDisplayName('   ###   ')).toThrow(
        BadRequestException,
      );
    });

    it('rejects leading minus operator reserved for boolean exclusion', () => {
      expect(() => service.normalizeDisplayName('-AI-Generated')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('toNormalizedKey & toUnaccentedKey', () => {
    it('collapses case, spaces, and underscores into a canonical lookup key', () => {
      expect(service.toNormalizedKey('Fate/Grand Order')).toBe(
        'fate/grand_order',
      );
      expect(service.toNormalizedKey('Genshin Impact')).toBe(
        service.toNormalizedKey('genshin_impact'),
      );
    });

    it('removes Vietnamese diacritics and maps đ/Đ to d', () => {
      expect(service.toUnaccentedKey('Phong cảnh Đẹp')).toBe('phong_canh_dep');
    });

    it('preserves CJK and Japanese Kana voiced marks (dakuten/handakuten)', () => {
      expect(service.toUnaccentedKey('葬送のフリーレン')).toBe(
        '葬送のフリーレン',
      );
      expect(service.toUnaccentedKey('ガンダム・ポータブル')).toBe(
        'ガンダム・ポータブル',
      );
    });
  });

  describe('parseTagInput & toSlug', () => {
    it('builds URL-safe slugs for both Vietnamese and Japanese tags', () => {
      const vi = service.parseTagInput('Thiết kế Ý tưởng');
      expect(vi.slug).toBe('thiet_ke_y_tuong');
      expect(vi.unaccentedName).toBe('thiet_ke_y_tuong');

      const slash = service.parseTagInput('Fate/Grand Order');
      expect(slash.slug).toBe('fate-grand_order');

      const jp = service.parseTagInput('葬送のフリーレン');
      expect(jp.slug).toBe('葬送のフリーレン');
    });

    it('respects explicit customSlug when provided', () => {
      const parsed = service.parseTagInput(
        '葬送のフリーレン',
        'frieren-beyond-journeys-end',
      );
      expect(parsed.slug).toBe('frieren-beyond-journeys-end');
    });
  });
});
