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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
    <Card className="border-border/80 overflow-hidden rounded-3xl shadow-xs">
      <CardHeader className="border-border/70 space-y-1.5 border-b p-6">
        <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
            <EyeOff className="size-4" aria-hidden="true" />
          </div>
          {title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed text-pretty">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="space-y-2.5">
          <p className="text-foreground text-xs font-semibold">
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
          <div className="space-y-2.5">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : mutedList.length === 0 ? (
          <Empty className="border-border/80 rounded-2xl border border-dashed py-12">
            <EmptyMedia variant="icon">
              <EyeOff className="text-muted-foreground size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-base">No Muted Tags</EmptyTitle>
              <EmptyDescription className="text-xs">
                Your personal NG-Tag mute list is currently empty. Tags added
                here and optionally their descendant sub-tags will be filtered
                out.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-border/60 border-border/70 divide-y overflow-hidden rounded-2xl border">
            {mutedList.map((entry) => (
              <div
                key={entry.id}
                className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-3 p-4 transition-colors"
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
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                    <GitBranch
                      className="text-primary size-3.5"
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
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 cursor-pointer rounded-lg transition-colors"
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
