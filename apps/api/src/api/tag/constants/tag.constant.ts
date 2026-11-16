export enum ETagCategory {
  GENERAL = 'general',
  COPYRIGHT = 'copyright',
  CHARACTER = 'character',
  ARTIST = 'artist',
  META = 'meta',
  SYSTEM = 'system',
}

export enum ETagSafetyRating {
  SAFE = 'safe',
  SENSITIVE = 'sensitive',
  R18 = 'r18',
  R18G = 'r18g',
}

export enum ETagStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  MERGED = 'merged',
  BANNED = 'banned',
}

export enum ETagAliasType {
  SYNONYM = 'synonym',
  ABBREVIATION = 'abbreviation',
  TYPO = 'typo',
  LEGACY_MERGE = 'legacy_merge',
}

export enum ETagRelationType {
  HIERARCHY = 'hierarchy',
  RELATED = 'related',
  DISAMBIGUATION = 'disambiguation',
}

export enum ETaggableEntityType {
  CMS_PAGE = 'cms_page',
  ARTWORK = 'artwork',
  FILE = 'file',
  POST = 'post',
  EVENT = 'event',
  JOB = 'job',
  COSPLAYER_PROFILE = 'cosplayer_profile',
}

export enum EEntityTagLogAction {
  ADD = 'add',
  REMOVE = 'remove',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  WORK_LOCK = 'work_lock',
  WORK_UNLOCK = 'work_unlock',
  REORDER = 'reorder',
  MERGE_REWIRE = 'merge_rewire',
}

export enum ETagTranslationSource {
  ADMIN = 'admin',
  COMMUNITY = 'community',
  SYSTEM = 'system',
}

export const DEFAULT_MAX_TAGS_PER_ENTITY = 10;
export const MAX_TAG_NAME_LENGTH = 100;
export const SUPPORTED_TAG_LOCALES = ['vi', 'en', 'jp'] as const;
export type SupportedTagLocale = (typeof SUPPORTED_TAG_LOCALES)[number];
