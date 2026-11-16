export type {
  JobSummaryResDto,
  JobDetailResDto,
  JobApplicationPayload,
  CreateJobPayload,
} from "@/services/jobs";

export type JobFilterId =
  "all" | "lookbook" | "event" | "crafting" | "game_ads" | "hcm" | "hanoi";

export interface JobFilterTag {
  id: JobFilterId;
  label: string;
}
