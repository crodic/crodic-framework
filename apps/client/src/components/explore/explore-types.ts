export interface ExploreItem {
  id: string;
  character: string;
  tag: string;
  tagLabel: string;
  image: string;
  likesCount: string;
  author: {
    name: string;
    avatarUrl: string;
    isVerified: boolean;
  };
}

export interface ExploreTag {
  id: string;
  label: string;
}
