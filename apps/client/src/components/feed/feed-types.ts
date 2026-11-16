export type {
  PostSummaryResDto,
  PostDetailResDto,
  PostAuthorSummaryDto,
  PostCommentResDto,
} from "@/services/posts";

export type { CosplayerSummaryResDto } from "@/services/cosplayer";
export type { EventSummaryResDto } from "@/services/events";

export interface TrendingTag {
  name: string;
  count: string;
  isHot?: boolean;
}
