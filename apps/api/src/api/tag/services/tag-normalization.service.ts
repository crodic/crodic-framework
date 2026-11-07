import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_TAG_NAME_LENGTH } from '../constants/tag.constant';

export interface NormalizedTagInput {
  displayName: string;
  normalizedName: string;
  unaccentedName: string;
  slug: string;
}

@Injectable()
export class TagNormalizationService {
  /**
   * Normalizes raw user/admin tag input using Unicode NFKC width-folding,
   * control-character stripping, leading '#' removal, and whitespace collapsing.
   */
  normalizeDisplayName(raw: string): string {
    if (typeof raw !== 'string') {
      throw new BadRequestException('Tag name must be a valid string');
    }

    const cleaned = raw
      .normalize('NFKC')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
      .trim()
      .replace(/^#+/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      throw new BadRequestException('Tag name cannot be empty');
    }

    if (cleaned.startsWith('-')) {
      throw new BadRequestException(
        'Tag name cannot start with "-" (reserved for exclusion search)',
      );
    }

    if (cleaned.length > MAX_TAG_NAME_LENGTH) {
      throw new BadRequestException(
        `Tag name cannot exceed ${MAX_TAG_NAME_LENGTH} characters`,
      );
    }

    return cleaned;
  }

  /**
   * Generates a canonical lookup key collapsing case and space/underscore variants
   * so orthographic variations like "Genshin Impact" and "genshin_impact" match.
   */
  toNormalizedKey(raw: string): string {
    const display = this.normalizeDisplayName(raw);
    return display.toLowerCase().replace(/[\s_]+/g, '_');
  }

  /**
   * Generates a Latin diacritic-insensitive lookup key (e.g. Vietnamese "Phong cảnh" -> "phong_canh")
   * while preserving CJK/Kana voiced marks (U+3099/U+309A).
   */
  toUnaccentedKey(raw: string): string {
    const normalized = this.toNormalizedKey(raw);
    return normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .normalize('NFC');
  }

  /**
   * Produces a clean URL-safe slug supporting both Latin (unaccented) and CJK characters.
   */
  toSlug(raw: string): string {
    const unaccented = this.toUnaccentedKey(raw);
    const slug = unaccented
      .replace(/[^\p{L}\p{N}_-]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      return `tag-${Buffer.from(unaccented).toString('hex').slice(0, 12)}`;
    }

    return slug.slice(0, 130);
  }

  /**
   * Computes all normalized representations for persistence or lookup.
   */
  parseTagInput(raw: string, customSlug?: string): NormalizedTagInput {
    const displayName = this.normalizeDisplayName(raw);
    const normalizedName = this.toNormalizedKey(displayName);
    const unaccentedName = this.toUnaccentedKey(displayName);
    const slug = customSlug
      ? this.toSlug(customSlug)
      : this.toSlug(displayName);

    return {
      displayName,
      normalizedName,
      unaccentedName,
      slug,
    };
  }

  /**
   * Normalizes a search prefix/query without throwing on empty or leading '-' tokens.
   */
  normalizeSearchTerm(raw: string): {
    normalized: string;
    unaccented: string;
  } {
    const cleaned = (raw || '')
      .normalize('NFKC')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
      .trim()
      .replace(/^#+/, '')
      .toLowerCase()
      .replace(/[\s_]+/g, '_');

    const unaccented = cleaned
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .normalize('NFC');

    return { normalized: cleaned, unaccented };
  }
}
