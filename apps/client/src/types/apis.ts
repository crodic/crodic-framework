export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  tokenExpires: number;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  hasPassword: boolean;
  verifiedAt: string | null;
  notifications?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
};

export type SocialAccount = {
  id: string;
  provider: "google";
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
};

export type UserSession = {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
  isCurrent: boolean;
};
