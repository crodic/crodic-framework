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
  videoUrl?: string | null;
  isCollage: boolean;
  collagePreviewUrls: string[];
  tagNamesCache: string[];
  collaborators?: PostCollaboratorDto[];
  isPublic: boolean;
  enableWatermark?: boolean;
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

export interface CreatePostMediaInput {
  mediaUrl: string;
  mediaType?: "image" | "video";
  sortOrder?: number;
  caption?: string;
  isCover?: boolean;
}

export interface CreatePostPayload {
  title: string;
  caption?: string;
  postType?: "photoset" | "wip" | "crafting" | "video" | "single" | "reel";
  albumCategory?: "series" | "general" | "group" | "premium";
  characterName?: string;
  fandomName?: string;
  coverImageUrl?: string;
  tags?: string[];
  isPublic?: boolean;
  enableWatermark?: boolean;
  collaborators?: PostCollaboratorDto[];
  media?: CreatePostMediaInput[];
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
        } else if (
          [
            "authorId",
            "albumCategory",
            "postType",
            "isPublic",
            "status",
            "isFeaturedWork",
            "copyrightTagId",
            "characterTagId",
            "tagId",
          ].includes(key)
        ) {
          searchParams.append(`filter[${key}]`, String(val));
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

export const getFollowingFeed = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<PostSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/posts/feed${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<PostSummaryResDto>>(url);
  return data;
};

export const getMyLikedPosts = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<PostSummaryResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/posts/liked${qs ? `?${qs}` : ""}`;
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
  const { data } = await http.get<PaginatedResponse<PostCommentResDto>>(
    `/api/v1/public/posts/${postId}/comments`
  );
  return data.data;
};

export const getPostCommentsPaginated = async (
  postId: string,
  page = 1,
  limit = 10,
  sort: "newest" | "popular" = "newest"
): Promise<PaginatedResponse<PostCommentResDto>> => {
  const sortParam =
    sort === "popular" ? "&sort[likesCount]=desc" : "&sort[createdAt]=desc";
  const { data } = await http.get<PaginatedResponse<PostCommentResDto>>(
    `/api/v1/public/posts/${postId}/comments?page=${page}&limit=${limit}${sortParam}`
  );
  return data;
};

export interface UpdatePostPayload {
  title?: string;
  caption?: string;
  postType?: "photoset" | "wip" | "crafting" | "video";
  albumCategory?: "series" | "general" | "group" | "premium";
  characterName?: string;
  fandomName?: string;
  coverImageUrl?: string;
  tags?: string[];
  isPublic?: boolean;
  enableWatermark?: boolean;
  media?: CreatePostMediaInput[];
}

export const createPost = async (
  payload: CreatePostPayload
): Promise<PostDetailResDto> => {
  const { data } = await http.post<PostDetailResDto>("/api/v1/posts", payload);
  return data;
};

export const updatePost = async (
  postId: string,
  payload: UpdatePostPayload
): Promise<PostDetailResDto> => {
  const { data } = await http.patch<PostDetailResDto>(
    `/api/v1/posts/${postId}`,
    payload
  );
  return data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await http.delete(`/api/v1/posts/${postId}`);
};

export interface ToggleLikeResDto {
  liked: boolean;
  likesCount: number;
}

export const toggleLikePost = async (
  postId: string
): Promise<ToggleLikeResDto> => {
  const { data } = await http.post<ToggleLikeResDto>(
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

export const toggleLikeComment = async (
  commentId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const { data } = await http.post<{ liked: boolean; likesCount: number }>(
    `/api/v1/posts/comments/${commentId}/like`
  );
  return data;
};

export const deletePostComment = async (commentId: string): Promise<void> => {
  await http.delete(`/api/v1/posts/comments/${commentId}`);
};
