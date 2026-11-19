"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import xior from "xior";
import { useAuthStore } from "@/store/use-auth-store";

export function AuthInitializer({
  initialToken,
}: {
  initialToken?: string | null;
}) {
  const currentToken = useAuthStore((state) => state.accessToken);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setIsHydrating = useAuthStore((state) => state.setIsHydrating);

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "tokens"],
    queryFn: async () => {
      const res = await xior.get<{ accessToken?: string }>("/api/auth/tokens");
      return res.data || {};
    },
    enabled: !currentToken && !initialToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (currentToken || initialToken) {
      setIsHydrating(false);
      return;
    }

    if (!isLoading) {
      if (data?.accessToken) {
        setTokens({ accessToken: data.accessToken });
      } else {
        setIsHydrating(false);
      }
    }
  }, [data, isLoading, currentToken, initialToken, setTokens, setIsHydrating]);

  return null;
}
