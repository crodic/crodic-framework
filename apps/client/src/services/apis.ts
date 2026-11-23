import { http } from "@/lib/http";
import xior from "xior";

export const getClientToken = async () => {
  const { data } = await xior.get<{
    accessToken: string;
  }>("/api/auth/tokens");
  return data;
};
