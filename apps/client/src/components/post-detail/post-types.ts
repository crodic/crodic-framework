export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount?: number;
}

export interface PostDetail {
  id: string;
  slug: string;
  title: string;
  caption: string;
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  photos: string[];
  tags: string[];
  likesCount: string;
  savesCount: string;
  sharesCount: string;
  commentsCount: number;
  comments: PostComment[];
  createdAt: string;
}
