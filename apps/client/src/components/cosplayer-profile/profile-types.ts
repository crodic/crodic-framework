export interface CosplayerProfileData {
  id: string;
  slug: string;
  name: string;
  handle: string;
  location: string;
  isVerified: boolean;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  stats: {
    followersCount: string;
    likesCount: string;
    albumsCount: number;
    charactersCount: number;
  };
  contact: {
    email: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  details: {
    height: string;
    experienceYears: string;
    skills: string[];
    specialties: string[];
  };
}

export interface CosplayerAlbum {
  id: string;
  title: string;
  category: "all" | "group" | "series" | "premium";
  categoryLabel: string;
  photosCount: number;
  updatedAt: string;
  isCollage?: boolean;
  collageImages?: string[];
  coverImage: string;
}

export interface CosplayerCharacter {
  id: string;
  characterName: string;
  series: string;
  coverImage: string;
  photosCount: number;
}
