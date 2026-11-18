import { http } from "@/lib/http";
import type { PaginatedResponse } from "@repo/query-builder";

export interface CollectionResDto {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string | null;
  isDefault: boolean;
  isPublic: boolean;
  itemsCount: number;
  previewThumbnails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItemResDto {
  id: string;
  collectionId: string;
  postId?: string | null;
  eventId?: string | null;
  mediaUrl?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateCollectionPayload {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddCollectionItemPayload {
  postId?: string;
  eventId?: string;
  mediaUrl?: string;
  sortOrder?: number;
}

export const getMyCollections = async (
  query?: Record<string, any>
): Promise<PaginatedResponse<CollectionResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/collections${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<CollectionResDto>>(url);
  return data;
};

export const createCollection = async (
  payload: CreateCollectionPayload
): Promise<CollectionResDto> => {
  const { data } = await http.post<CollectionResDto>(
    "/api/v1/collections",
    payload
  );
  return data;
};

export const getCollectionDetail = async (
  idOrSlug: string
): Promise<CollectionResDto> => {
  const { data } = await http.get<CollectionResDto>(
    `/api/v1/collections/${idOrSlug}`
  );
  return data;
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  await http.delete(`/api/v1/collections/${collectionId}`);
};

export const getCollectionItems = async (
  collectionId: string,
  query?: Record<string, any>
): Promise<PaginatedResponse<CollectionItemResDto>> => {
  const searchParams = new URLSearchParams();
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
  }
  const qs = searchParams.toString();
  const url = `/api/v1/collections/${collectionId}/items${qs ? `?${qs}` : ""}`;
  const { data } = await http.get<PaginatedResponse<CollectionItemResDto>>(url);
  return data;
};

export const addCollectionItem = async (
  collectionId: string,
  payload: AddCollectionItemPayload
): Promise<CollectionItemResDto> => {
  const { data } = await http.post<CollectionItemResDto>(
    `/api/v1/collections/${collectionId}/items`,
    payload
  );
  return data;
};

export const removeCollectionItem = async (
  collectionId: string,
  itemId: string
): Promise<void> => {
  await http.delete(`/api/v1/collections/${collectionId}/items/${itemId}`);
};
