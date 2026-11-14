export interface EventParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  day: string; // e.g. "15"
  month: string; // e.g. "Th12"
  year?: string; // e.g. "2026"
  dateString: string; // e.g. "15/12/2026"
  location: string; // e.g. "TP.HCM" or "Hà Nội"
  venue: string; // e.g. "SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn"
  image: string;
  tags: string[]; // ['upcoming', 'recruiting', 'hcm', 'hanoi']
  isRecruiting: boolean;
  participants: EventParticipant[];
  description: string;
  ticketPrice?: string;
  schedule?: { time: string; activity: string }[];
  categories?: string[];
}

export interface FeaturedFestival {
  id: string;
  title: string;
  city: string;
  date: string;
  description: string;
  bannerImage: string;
  registrationCta: string;
}

export interface EventFilterTag {
  id: string;
  label: string;
}
