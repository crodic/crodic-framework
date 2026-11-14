"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Lock,
  LockOpen,
  ShieldCheck,
  Tag,
  Tags,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  addEntityTagClient,
  removeEntityTagClient,
  reorderEntityTagsClient,
  setEntityEditLockClient,
  setEntityTagLockClient,
  useEntityTagLogs,
  useEntityTags,
  type TaggableEntityType,
} from "@/services/tags";
import { useAuthStore } from "@/store/use-auth-store";
import { TagHoverCard } from "./tag-hover-card";
import { TagInputAutocomplete } from "./tag-input-autocomplete";

export interface CollaborativeTagBarProps {
  entityType: TaggableEntityType;
  entityId: string;
  locale?: string;
}

export function CollaborativeTagBar({
  entityType,
  entityId,
  locale = "en",
}: CollaborativeTagBarProps) {
  const t = useTranslations("Tags");
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(useAuthStore((s) => s.accessToken));
  const [logsOpen, setLogsOpen] = useState(false);

  const { data, isLoading } = useEntityTags(entityType, entityId, locale);
  const { data: logs = [], isLoading: isLoadingLogs } = useEntityTagLogs(
    entityType,
    entityId,
    logsOpen
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["client-entity-tags", entityType, entityId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["client-entity-tag-logs", entityType, entityId],
    });
  };

  const addMutation = useMutation({
    mutationFn: (tag: string) =>
      addEntityTagClient({ entityType, entityId, tag }),
    onSuccess: () => {
      toast.success("Tag attached");
      invalidate();
    },
    onError: () => {
      toast.error("Unable to attach tag. Check tag limit or permissions.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (tagId: string) =>
      removeEntityTagClient({ entityType, entityId, tagId }),
    onSuccess: () => {
      toast.success("Tag removed");
      invalidate();
    },
    onError: () => {
      toast.error("Protected creator or locked tags cannot be removed.");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (tagIds: string[]) =>
      reorderEntityTagsClient({ entityType, entityId, tagIds }),
    onSuccess: invalidate,
    onError: () => toast.error("Could not reorder tags"),
  });

  const editLockMutation = useMutation({
    mutationFn: (tagEditLocked: boolean) =>
      setEntityEditLockClient({ entityType, entityId, tagEditLocked }),
    onSuccess: () => {
      toast.success("Tag edit status updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update edit permissions"),
  });

  const lockTagMutation = useMutation({
    mutationFn: ({ tagId, locked }: { tagId: string; locked: boolean }) =>
      setEntityTagLockClient({ entityType, entityId, tagId, locked }),
    onSuccess: () => {
      toast.success("Tag status updated");
      invalidate();
    },
    onError: () => toast.error("Could not lock or unlock tag"),
  });

  if (isLoading) {
    return (
      <div className="bg-card/70 border-border/80 rounded-2xl border p-4 shadow-xs">
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  const tags = data?.tags ?? [];
  const maxTags = data?.maxTags ?? 10;
  const canEdit = Boolean(data?.canEdit) && isAuthenticated;
  const isOwner = Boolean(data?.isOwner);

  const moveTag = (idx: number, delta: -1 | 1) => {
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= tags.length) return;
    const ids = tags.map((t) => t.tagId);
    const [moved] = ids.splice(idx, 1);
    if (!moved) return;
    ids.splice(targetIdx, 0, moved);
    reorderMutation.mutate(ids);
  };

  return (
    <section
      aria-label="Collaborative tags"
      className="bg-card/80 border-border/80 space-y-4 rounded-2xl border p-4 shadow-xs backdrop-blur-xs sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
            <Tags className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-sm font-bold tracking-tight">
                {t("tagsTitle")}
              </h3>
              <Badge
                variant="outline"
                className="font-mono text-[11px] tabular-nums"
              >
                <span role="status" aria-atomic="true">
                  {tags.length} / {maxTags}
                </span>
              </Badge>
              {data?.tagEditLocked && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Lock className="size-3" aria-hidden="true" />
                  {t("communityEditsLocked")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{t("freezeEdits")}</span>
              <Switch
                checked={Boolean(data?.tagEditLocked)}
                disabled={editLockMutation.isPending}
                onCheckedChange={(checked) => editLockMutation.mutate(checked)}
                aria-label={t("freezeEdits")}
              />
            </div>
          )}

          <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
              >
                <History className="size-3.5" aria-hidden="true" />
                {t("editHistory")}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>{t("auditLogTitle")}</SheetTitle>
                <SheetDescription>{t("auditLogDesc")}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 max-h-[calc(100dvh-9rem)] divide-y overflow-y-auto px-4">
                {isLoadingLogs ? (
                  <div className="space-y-2 py-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-xs">
                    No tag edits recorded for this item yet.
                  </p>
                ) : (
                  logs.map((entry) => (
                    <div key={entry.id} className="space-y-1 py-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] uppercase"
                        >
                          {entry.action}
                        </Badge>
                        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                          {format(
                            new Date(entry.createdAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <p className="text-foreground font-medium">
                        {entry.tagNameSnapshot
                          ? `#${entry.tagNameSnapshot}`
                          : "Tag Configuration"}
                      </p>
                      <p className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                        {entry.isAdminAction && (
                          <ShieldCheck
                            className="text-primary size-3"
                            aria-hidden="true"
                          />
                        )}
                        {entry.actorName ||
                          (entry.isAdminAction ? "Moderator" : "Member")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Attached Tag Pills */}
      {tags.length === 0 ? (
        <div className="text-muted-foreground border-border/80 rounded-xl border border-dashed p-5 text-center text-xs">
          <p>
            No tags attached yet.{" "}
            {isAuthenticated
              ? "Be the first to classify this item with community tags!"
              : "Sign in to contribute tags."}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((item, idx) => (
            <TagHoverCard
              key={item.id}
              locale={locale}
              slug={item.slug}
              name={item.name}
              translatedName={item.translatedName}
              category={item.category}
              isOfficial={item.isOfficial}
              isAuthorTag={item.isAuthorTag}
              locked={item.locked}
              showWikiLink
              trailingSlot={
                (isOwner || item.deletable) && (
                  <span className="border-border/70 ml-1 inline-flex items-center gap-0.5 border-l pl-1">
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          disabled={idx === 0 || reorderMutation.isPending}
                          aria-label={`Move tag ${item.name} left`}
                          onClick={() => moveTag(idx, -1)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm p-0.5 disabled:opacity-30"
                        >
                          <ChevronLeft className="size-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            idx === tags.length - 1 || reorderMutation.isPending
                          }
                          aria-label={`Move tag ${item.name} right`}
                          onClick={() => moveTag(idx, 1)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm p-0.5 disabled:opacity-30"
                        >
                          <ChevronRight className="size-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={
                            item.locked
                              ? `Unlock tag ${item.name}`
                              : `Lock tag ${item.name}`
                          }
                          onClick={() =>
                            lockTagMutation.mutate({
                              tagId: item.tagId,
                              locked: !item.locked,
                            })
                          }
                          className="text-muted-foreground hover:text-primary cursor-pointer rounded-sm p-0.5"
                        >
                          {item.locked ? (
                            <LockOpen className="size-3" aria-hidden="true" />
                          ) : (
                            <Lock className="size-3" aria-hidden="true" />
                          )}
                        </button>
                      </>
                    )}
                    {item.deletable && (
                      <button
                        type="button"
                        disabled={removeMutation.isPending}
                        aria-label={`Remove tag ${item.name}`}
                        onClick={() => removeMutation.mutate(item.tagId)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer rounded-sm p-0.5"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    )}
                  </span>
                )
              }
            />
          ))}
        </div>
      )}

      {/* Inline Folksonomy Add Bar */}
      {canEdit && tags.length < maxTags ? (
        <div className="pt-1">
          <TagInputAutocomplete
            locale={locale}
            currentCount={tags.length}
            maxTags={maxTags}
            disabled={addMutation.isPending}
            excludeNames={tags.map((t) => t.name)}
            onSelectTag={(tagName) => addMutation.mutate(tagName)}
            placeholder="Add tag (up to 10 tags, * creator tags are protected)..."
          />
        </div>
      ) : !isAuthenticated ? (
        <div className="text-muted-foreground border-border/60 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <Tag className="text-primary size-3.5" />
            Want to help categorize with community folksonomy tags?
          </span>
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in to add tags
          </Link>
        </div>
      ) : null}
    </section>
  );
}
