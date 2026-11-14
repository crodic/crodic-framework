export type JobFilterId =
  "all" | "lookbook" | "event" | "crafting" | "game_ads" | "hcm" | "hanoi";

export interface JobFilterTag {
  id: JobFilterId;
  label: string;
}

export interface JobItem {
  id: string;
  brandName: string;
  brandLogo: string;
  brandInitials?: string;
  brandColor?: string;
  isVerified: boolean;
  title: string;
  budget: string;
  location: string;
  deadline: string;
  requirements: string;
  category: string;
  tags: JobFilterId[];
  description?: string;
  perks?: string[];
  contactEmail?: string;
}
