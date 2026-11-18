import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export type PostCollaboratorRole =
  "photographer" | "mua" | "cosplayer" | "prop_maker" | "retoucher" | "staff";

export interface PostCollaboratorDto {
  role: PostCollaboratorRole;
  name: string;
  userId?: string | null;
  socialUrl?: string | null;
}

export interface PostMediaResDto {
  id: string;
  postId: string;
  fileId?: string | null;
  mediaUrl: string;
  mediaType: "image" | "video";
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isCover: boolean;
  caption?: string | null;
}

export interface PostAuthorSummaryDto {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  role?: string;
}

export interface PostSummaryResDto {
  id: string;
  slug: string;
  title: string;
  caption?: string | null;
  postType: "photoset" | "single" | "video" | "reel";
  albumCategory:
    | "series"
    | "general"
    | "group"
    | "premium"
    | "studio"
    | "event"
    | "original"
    | "casual"
    | string;
  characterName?: string | null;
  fandomName?: string | null;
  coverImageUrl: string;
  isCollage: boolean;
  collagePreviewUrls: string[];
  tagNamesCache: string[];
  collaborators?: PostCollaboratorDto[];
  isPublic: boolean;
  status: "draft" | "published" | "archived" | "moderation_flagged";
  isFeaturedWork: boolean;
  photosCount: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  viewsCount: number;
  trendingScore: number;
  publishedAt: string;
  author: PostAuthorSummaryDto;
  isLikedByCurrentUser?: boolean;
  isSavedByCurrentUser?: boolean;
}

export interface PostDetailResDto extends PostSummaryResDto {
  enableWatermark: boolean;
  cosplayerCharacterId?: string | null;
  characterTagId?: string | null;
  copyrightTagId?: string | null;
  media: PostMediaResDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PostCommentResDto {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string | null;
  content: string;
  likesCount: number;
  author: PostAuthorSummaryDto;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
}

export interface CreatePostPayload {
  title: string;
  caption?: string;
  postType?: "photoset" | "single" | "video" | "reel";
  albumCategory?: "series" | "event" | "original" | "studio" | "casual";
  coverImageUrl?: string;
  tags?: string[];
  collaborators?: PostCollaboratorDto[];
  media?: {
    mediaUrl: string;
    mediaType?: "image" | "video";
    sortOrder?: number;
    caption?: string;
  }[];
}

export const getPosts = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<PostSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        if (key === "search") {
          searchParams.append("filter[search]", String(val));
          searchParams.append("search", String(val));
        } else {
          searchParams.append(key, String(val));
        }
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/public/posts${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<PostSummaryResDto>>(url);
  return data;
};

export const getPostBySlug = async (
  slug: string
): Promise<PostDetailResDto> => {
  const { data } = await http.get<PostDetailResDto>(
    `/api/v1/public/posts/${slug}`
  );
  return data;
};

export const getPostComments = async (
  postId: string
): Promise<PostCommentResDto[]> => {
  const { data } = await http.get<PostCommentResDto[]>(
    `/api/v1/public/posts/${postId}/comments`
  );
  return data || [];
};

export const createPost = async (
  payload: CreatePostPayload
): Promise<PostDetailResDto> => {
  const { data } = await http.post<PostDetailResDto>("/api/v1/posts", payload);
  return data;
};

export const toggleLikePost = async (
  postId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const { data } = await http.post<{ liked: boolean; likesCount: number }>(
    `/api/v1/posts/${postId}/like`
  );
  return data;
};

export const addPostComment = async (
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<PostCommentResDto> => {
  const { data } = await http.post<PostCommentResDto>(
    `/api/v1/posts/${postId}/comments`,
    {
      content,
      parentCommentId,
    }
  );
  return data;
};
