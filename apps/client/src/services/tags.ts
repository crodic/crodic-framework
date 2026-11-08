import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export type TagCategory =
  "general" | "copyright" | "character" | "artist" | "meta" | "system";

export type TagSafetyRating = "safe" | "sensitive" | "r18" | "r18g";
export type TagStatus = "active" | "pending" | "merged" | "banned";
export type TaggableEntityType = "cms_page" | "artwork" | "file" | "post";

export interface TagAliasItem {
  id: string;
  aliasName: string;
  aliasType: "synonym" | "abbreviation" | "typo" | "legacy_merge";
  locale?: string | null;
}

export interface TagTranslationItem {
  id: string;
  locale: string;
  translatedName: string;
  shortSummary?: string | null;
}

export interface TagSummary {
  id: string;
  slug: string;
  name: string;
  translatedName?: string | null;
  shortSummary?: string | null;
  featuredImageUrl?: string | null;
  category: TagCategory;
  safetyRating: TagSafetyRating;
  status: TagStatus;
  isOfficial: boolean;
  isSystem: boolean;
  usageCount: number;
  trendingScore: number;
  translations?: TagTranslationItem[];
  aliases?: TagAliasItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TagGraph {
  parents: TagSummary[];
  children: TagSummary[];
  siblings: TagSummary[];
  related: TagSummary[];
  disambiguations: TagSummary[];
}

export interface TagDetail extends TagSummary {
  redirectSlug?: string | null;
  mergedIntoId?: string | null;
  isMutedByCurrentUser?: boolean;
  hasEncyclopedia?: boolean;
  graph: TagGraph;
}

export interface TagAutocompleteItem {
  id: string;
  slug: string;
  name: string;
  translatedName?: string | null;
  matchedAlias?: string | null;
  category: TagCategory;
  safetyRating: TagSafetyRating;
  isOfficial: boolean;
  usageCount: number;
}

export interface TagTooltipData {
  id: string;
  slug: string;
  name: string;
  translatedName?: string | null;
  summary?: string | null;
  featuredImageUrl?: string | null;
  category: TagCategory;
  safetyRating: TagSafetyRating;
  isOfficial: boolean;
  usageCount: number;
  parentTag?: TagSummary | null;
}

export interface TagEncyclopediaRevision {
  id: string;
  revisionNumber: number;
  summary: string;
  body: string;
  changeNote?: string | null;
  editorName?: string | null;
  createdAt: string;
}

export interface TagEncyclopedia {
  id: string;
  tagId: string;
  locale: string;
  summary: string;
  body: string;
  featuredImageUrl?: string | null;
  isEditLocked: boolean;
  currentRevision: number;
  viewCount: number;
  tag: TagDetail;
  revisions?: TagEncyclopediaRevision[];
  updatedAt: string;
}

export interface EntityTagItem {
  id: string;
  tagId: string;
  slug: string;
  name: string;
  translatedName?: string | null;
  category: TagCategory;
  safetyRating: TagSafetyRating;
  isOfficial: boolean;
  isAuthorTag: boolean;
  locked: boolean;
  deletable: boolean;
  sortOrder: number;
  usageCount: number;
}

export interface EntityTagListResponse {
  entityType: TaggableEntityType;
  entityId: string;
  tagEditLocked: boolean;
  maxTags: number;
  canEdit: boolean;
  isOwner: boolean;
  tags: EntityTagItem[];
}

export interface EntityTagLogItem {
  id: string;
  entityType: TaggableEntityType;
  entityId: string;
  tagId?: string | null;
  tagNameSnapshot?: string | null;
  action: string;
  actorName?: string | null;
  isAdminAction: boolean;
  createdAt: string;
}

export interface MutedTagEntry {
  id: string;
  includeChildren: boolean;
  tag: TagSummary;
  createdAt: string;
}

export interface BooleanSearchResponse {
  parsed: {
    mustInclude: string[];
    anyInclude: string[];
    mustExclude: string[];
  };
  matchedTags: TagDetail[];
  data: {
    entityType: TaggableEntityType;
    entityId: string;
    tags: EntityTagItem[];
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function getServerApiBase(): string {
  return (
    process.env.SERVER_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  );
}

// ─── SSR FETCH HELPERS (Next.js App Router Server Components) ───

export async function fetchPublicTagsDirectory(params: {
  locale: string;
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: TagSummary[];
  meta: { totalItems: number; totalPages: number; currentPage: number };
}> {
  try {
    const url = new URL(`${getServerApiBase()}/api/v1/public/tags`);
    url.searchParams.set("locale", params.locale);
    url.searchParams.set("page", String(params.page ?? 1));
    url.searchParams.set("limit", String(params.limit ?? 24));
    url.searchParams.set("sort", params.sort || "-usageCount");
    if (params.search?.trim()) {
      url.searchParams.set("filter[search]", params.search.trim());
    }
    if (params.category && params.category !== "all") {
      url.searchParams.set("filter[category]", params.category);
    }

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        data: [],
        meta: { totalItems: 0, totalPages: 1, currentPage: 1 },
      };
    }
    return await res.json();
  } catch {
    return {
      data: [],
      meta: { totalItems: 0, totalPages: 1, currentPage: 1 },
    };
  }
}

export async function fetchTrendingTags(
  locale: string,
  limit = 14
): Promise<TagSummary[]> {
  try {
    const url = new URL(`${getServerApiBase()}/api/v1/public/tags/trending`);
    url.searchParams.set("locale", locale);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchTagBySlugSSR(
  slug: string,
  locale: string,
  accessToken?: string
): Promise<TagDetail | null> {
  try {
    const url = new URL(
      `${getServerApiBase()}/api/v1/public/tags/by-slug/${encodeURIComponent(slug)}`
    );
    url.searchParams.set("locale", locale);

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchTagEncyclopediaBySlugSSR(
  slug: string,
  locale: string
): Promise<TagEncyclopedia | null> {
  try {
    const url = new URL(
      `${getServerApiBase()}/api/v1/public/tags/encyclopedia/${encodeURIComponent(slug)}`
    );
    url.searchParams.set("locale", locale);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchBooleanTagSearchSSR(params: {
  tagQuery: string;
  locale: string;
  expandHierarchy?: boolean;
  page?: number;
  limit?: number;
  accessToken?: string;
}): Promise<BooleanSearchResponse> {
  const fallback: BooleanSearchResponse = {
    parsed: { mustInclude: [], anyInclude: [], mustExclude: [] },
    matchedTags: [],
    data: [],
    meta: { total: 0, page: 1, limit: 12, totalPages: 1 },
  };
  try {
    const url = new URL(
      `${getServerApiBase()}/api/v1/public/tags/search-content`
    );
    url.searchParams.set("tagQuery", params.tagQuery);
    url.searchParams.set("locale", params.locale);
    url.searchParams.set(
      "expandHierarchy",
      params.expandHierarchy === false ? "false" : "true"
    );
    url.searchParams.set("page", String(params.page ?? 1));
    url.searchParams.set("limit", String(params.limit ?? 12));

    const headers: Record<string, string> = {};
    if (params.accessToken) {
      headers.Authorization = `Bearer ${params.accessToken}`;
    }

    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

// ─── CLIENT INTERACTIVE API & TANSTACK QUERY HOOKS ───

export async function autocompleteTagsClient(
  q: string,
  locale = "en",
  limit = 10
): Promise<TagAutocompleteItem[]> {
  const { data } = await http.get<TagAutocompleteItem[]>(
    "/api/v1/public/tags/autocomplete",
    {
      params: { q, locale, limit },
    }
  );
  return Array.isArray(data) ? data : [];
}

export async function getTagTooltipClient(
  slug: string,
  locale = "en"
): Promise<TagTooltipData> {
  const { data } = await http.get<TagTooltipData>(
    `/api/v1/public/tags/by-slug/${encodeURIComponent(slug)}/tooltip`,
    { params: { locale } }
  );
  return data;
}

export async function getEntityTagsClient(
  entityType: TaggableEntityType,
  entityId: string,
  locale = "en"
): Promise<EntityTagListResponse> {
  const { data } = await http.get<EntityTagListResponse>(
    `/api/v1/entity-tags/${entityType}/${entityId}`,
    { params: { locale } }
  );
  return data;
}

export async function addEntityTagClient(params: {
  entityType: TaggableEntityType;
  entityId: string;
  tag: string;
}): Promise<EntityTagListResponse> {
  const { data } = await http.post<EntityTagListResponse>(
    `/api/v1/entity-tags/${params.entityType}/${params.entityId}`,
    { tagName: params.tag }
  );
  return data;
}

export async function removeEntityTagClient(params: {
  entityType: TaggableEntityType;
  entityId: string;
  tagId: string;
}): Promise<EntityTagListResponse> {
  const { data } = await http.delete<EntityTagListResponse>(
    `/api/v1/entity-tags/${params.entityType}/${params.entityId}/${params.tagId}`
  );
  return data;
}

export async function setEntityTagLockClient(params: {
  entityType: TaggableEntityType;
  entityId: string;
  tagId: string;
  locked: boolean;
}): Promise<EntityTagListResponse> {
  const { data } = await http.patch<EntityTagListResponse>(
    `/api/v1/entity-tags/${params.entityType}/${params.entityId}/governance`,
    { tagId: params.tagId, isLocked: params.locked }
  );
  return data;
}

export async function setEntityEditLockClient(params: {
  entityType: TaggableEntityType;
  entityId: string;
  tagEditLocked: boolean;
}): Promise<EntityTagListResponse> {
  const { data } = await http.patch<EntityTagListResponse>(
    `/api/v1/entity-tags/${params.entityType}/${params.entityId}/governance`,
    { tagEditLocked: params.tagEditLocked }
  );
  return data;
}

export async function reorderEntityTagsClient(params: {
  entityType: TaggableEntityType;
  entityId: string;
  tagIds: string[];
}): Promise<EntityTagListResponse> {
  const { data } = await http.patch<EntityTagListResponse>(
    `/api/v1/entity-tags/${params.entityType}/${params.entityId}/governance`,
    { orderedTagIds: params.tagIds }
  );
  return data;
}

export async function getEntityTagLogsClient(
  entityType: TaggableEntityType,
  entityId: string
): Promise<EntityTagLogItem[]> {
  const { data } = await http.get<EntityTagLogItem[]>(
    `/api/v1/entity-tags/${entityType}/${entityId}/logs`
  );
  return Array.isArray(data) ? data : [];
}

export async function getMutedTagsClient(
  locale = "en"
): Promise<MutedTagEntry[]> {
  const { data } = await http.get<MutedTagEntry[]>("/api/v1/user/muted-tags", {
    params: { locale },
  });
  return Array.isArray(data) ? data : [];
}

export async function muteTagClient(params: {
  tagId: string;
  includeChildren?: boolean;
}): Promise<MutedTagEntry[]> {
  const { data } = await http.post<MutedTagEntry[]>("/api/v1/user/muted-tags", {
    tagId: params.tagId,
    includeChildren: params.includeChildren ?? true,
  });
  return data;
}

export async function unmuteTagClient(tagId: string): Promise<MutedTagEntry[]> {
  const { data } = await http.delete<MutedTagEntry[]>(
    `/api/v1/user/muted-tags/${tagId}`
  );
  return data;
}

export async function contributeEncyclopediaClient(params: {
  tagId: string;
  locale: string;
  summary: string;
  body: string;
  changeNote?: string;
}): Promise<TagEncyclopedia> {
  const { data } = await http.put<TagEncyclopedia>(
    `/api/v1/user/tags/${params.tagId}/encyclopedia`,
    {
      locale: params.locale,
      summary: params.summary,
      body: params.body,
      changeNote: params.changeNote,
    }
  );
  return data;
}

export function useTagAutocomplete(q: string, locale = "en", enabled = true) {
  return useQuery({
    queryKey: ["client-tag-autocomplete", q, locale],
    queryFn: () => autocompleteTagsClient(q, locale),
    enabled,
    staleTime: 15_000,
  });
}

export function useTagTooltip(slug: string, locale = "en", enabled = false) {
  return useQuery({
    queryKey: ["client-tag-tooltip", slug, locale],
    queryFn: () => getTagTooltipClient(slug, locale),
    enabled: Boolean(slug) && enabled,
    staleTime: 60_000,
  });
}

export function useEntityTags(
  entityType: TaggableEntityType,
  entityId: string,
  locale = "en"
) {
  return useQuery({
    queryKey: ["client-entity-tags", entityType, entityId, locale],
    queryFn: () => getEntityTagsClient(entityType, entityId, locale),
    enabled: Boolean(entityId),
  });
}

export function useEntityTagLogs(
  entityType: TaggableEntityType,
  entityId: string,
  enabled = false
) {
  return useQuery({
    queryKey: ["client-entity-tag-logs", entityType, entityId],
    queryFn: () => getEntityTagLogsClient(entityType, entityId),
    enabled: Boolean(entityId) && enabled,
  });
}

export function useMutedTags(locale = "en", enabled = true) {
  return useQuery({
    queryKey: ["client-muted-tags", locale],
    queryFn: () => getMutedTagsClient(locale),
    enabled,
  });
}
