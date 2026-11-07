"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeOff, GitBranch, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import { TagInputAutocomplete } from "@/components/tags/tag-input-autocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  muteTagClient,
  unmuteTagClient,
  useMutedTags,
  type TagAutocompleteItem,
} from "@/services/tags";

export function MutedTagsManager({
  locale,
  title,
  description,
}: {
  locale: string;
  title: string;
  description: string;
}) {
  const t = useTranslations("Tags");
  const queryClient = useQueryClient();
  const { data: mutedList = [], isLoading } = useMutedTags(locale);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["client-muted-tags"] });
  };

  const upsertMutation = useMutation({
    mutationFn: muteTagClient,
    onSuccess: () => {
      toast.success(t("mutedTagSaved"));
      invalidate();
    },
    onError: () => toast.error("Failed to save muted tag"),
  });

  const removeMutation = useMutation({
    mutationFn: unmuteTagClient,
    onSuccess: () => {
      toast.success("Tag unmuted");
      invalidate();
    },
    onError: () => toast.error("Failed to unmute tag"),
  });

  return (
    <Card className="shadow-xs">
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <EyeOff className="text-primary size-5" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Search &amp; Add Canonical Tag to Personal NG List
          </p>
          <TagInputAutocomplete
            locale={locale}
            allowCustomFolksonomy={false}
            excludeNames={mutedList.map((m) => m.tag.name)}
            placeholder="Search canonical tag to mute (e.g. Horror, R-18, Spoilers)..."
            onSelectTag={(_name, item?: TagAutocompleteItem) => {
              if (!item) return;
              upsertMutation.mutate({
                tagId: item.id,
                includeChildren: true,
              });
            }}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : mutedList.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-xs">
            Your personal NG-Tag mute list is currently empty.
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {mutedList.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5"
              >
                <TagHoverCard
                  locale={locale}
                  slug={entry.tag.slug}
                  name={entry.tag.name}
                  translatedName={entry.tag.translatedName}
                  category={entry.tag.category}
                  usageCount={entry.tag.usageCount}
                />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <GitBranch
                      className="text-muted-foreground size-3.5"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      {t("muteSubTags")}
                    </span>
                    <Switch
                      checked={entry.includeChildren}
                      disabled={upsertMutation.isPending}
                      onCheckedChange={(checked) =>
                        upsertMutation.mutate({
                          tagId: entry.tag.id,
                          includeChildren: checked,
                        })
                      }
                      aria-label={`Mute descendant sub-tags of ${entry.tag.name}`}
                    />
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={removeMutation.isPending}
                    aria-label={`Unmute tag ${entry.tag.name}`}
                    onClick={() => removeMutation.mutate(entry.tag.id)}
                    className="text-destructive hover:text-destructive size-8"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
