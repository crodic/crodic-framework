import { http } from "@/lib/http";

export type ReportTargetType = "post" | "user" | "comment" | "event";

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface ContentReportResDto {
  id: string;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string | null;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}

export const submitContentReport = async (
  payload: CreateReportPayload
): Promise<ContentReportResDto> => {
  const { data } = await http.post<ContentReportResDto>(
    "/api/v1/reports",
    payload
  );
  return data;
};
