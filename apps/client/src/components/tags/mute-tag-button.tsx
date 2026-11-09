"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { muteTagClient, unmuteTagClient } from "@/services/tags";
import { useAuthStore } from "@/store/use-auth-store";

export function MuteTagButton({
  tagId,
  tagName,
  initialMuted = false,
  muteLabel,
  unmuteLabel,
}: {
  tagId: string;
  tagName: string;
  initialMuted?: boolean;
  muteLabel: string;
  unmuteLabel: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(useAuthStore((s) => s.accessToken));
  const [isMuted, setIsMuted] = useState(initialMuted);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isMuted) {
        await unmuteTagClient(tagId);
        return false;
      }
      await muteTagClient({ tagId, includeChildren: true });
      return true;
    },
    onSuccess: (nextState) => {
      setIsMuted(nextState);
      void queryClient.invalidateQueries({ queryKey: ["client-muted-tags"] });
      toast.success(
        nextState
          ? `Muted #${tagName} (and child sub-tags)`
          : `Unmuted #${tagName}`
      );
      router.refresh();
    },
    onError: () => {
      toast.error("Could not update muted tag settings.");
    },
  });

  return (
    <Button
      type="button"
      variant={isMuted ? "secondary" : "outline"}
      size="sm"
      disabled={toggleMutation.isPending}
      onClick={() => {
        if (!isAuthenticated) {
          router.push("/auth/login");
          return;
        }
        toggleMutation.mutate();
      }}
      className="cursor-pointer gap-1.5 rounded-xl font-medium"
    >
      {isMuted ? (
        <>
          <Eye className="size-4" aria-hidden="true" />
          {unmuteLabel}
        </>
      ) : (
        <>
          <EyeOff className="size-4" aria-hidden="true" />
          {muteLabel}
        </>
      )}
    </Button>
  );
}
