"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Edit3, History, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  contributeEncyclopediaClient,
  type TagEncyclopediaRevision,
} from "@/services/tags";
import { useAuthStore } from "@/store/use-auth-store";

interface WikiCommunityEditorProps {
  tagId: string;
  tagName: string;
  locale: string;
  initialSummary?: string;
  initialBody?: string;
  isEditLocked?: boolean;
  currentRevision?: number;
  revisions?: TagEncyclopediaRevision[];
  contributeLabel: string;
  lockedLabel: string;
  revisionsLabel: string;
}

export function WikiCommunityEditor({
  tagId,
  tagName,
  locale,
  initialSummary = "",
  initialBody = "",
  isEditLocked = false,
  currentRevision = 0,
  revisions = [],
  contributeLabel,
  lockedLabel,
  revisionsLabel,
}: WikiCommunityEditorProps) {
  const t = useTranslations("Tags");
  const router = useRouter();
  const isAuthenticated = Boolean(useAuthStore((s) => s.accessToken));

  const [editOpen, setEditOpen] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [body, setBody] = useState(
    initialBody ||
      `<p><strong>#${tagName}</strong> is a canonical folksonomy tag in the community taxonomy graph.</p>`
  );
  const [changeNote, setChangeNote] = useState("");

  const submitMutation = useMutation({
    mutationFn: () =>
      contributeEncyclopediaClient({
        tagId,
        locale,
        summary: summary.trim(),
        body: body.trim(),
        changeNote: changeNote.trim() || "Community encyclopedia contribution",
      }),
    onSuccess: () => {
      toast.success(t("wikiPublishedSuccess"));
      setEditOpen(false);
      setChangeNote("");
      router.refresh();
    },
    onError: () => {
      toast.error(t("wikiPublishedError"));
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {revisions.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <History className="size-4" aria-hidden="true" />
              {revisionsLabel}
              <Badge
                variant="secondary"
                className="ml-0.5 px-1.5 py-0 font-mono text-[10px] tabular-nums"
              >
                v{currentRevision}
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{t("revisionHistoryTitle")}</SheetTitle>
              <SheetDescription>
                {t("wikiSnapshotDesc", {
                  tagName,
                  locale: locale.toUpperCase(),
                })}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 max-h-[calc(100dvh-9rem)] divide-y overflow-y-auto px-4">
              {revisions.map((rev) => (
                <div key={rev.id} className="space-y-1.5 py-3.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          rev.revisionNumber === currentRevision
                            ? "default"
                            : "outline"
                        }
                        className="font-mono text-[10px] tabular-nums"
                      >
                        v{rev.revisionNumber}
                      </Badge>
                      <span className="font-medium">
                        {rev.editorName || t("wikiCommunityEditorDefault")}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                      {format(new Date(rev.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  {rev.changeNote && (
                    <p className="text-muted-foreground text-pretty">
                      {rev.changeNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {isEditLocked ? (
        <Badge variant="outline" className="h-8 gap-1.5 px-3 text-xs">
          <Lock className="size-3.5" aria-hidden="true" />
          {lockedLabel}
        </Badge>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!isAuthenticated) {
              router.push("/auth/login");
              return;
            }
            setSummary(initialSummary);
            setBody(
              initialBody ||
                `<p><strong>#${tagName}</strong> — write community lore, terminology notes, and usage guidelines here.</p>`
            );
            setEditOpen(true);
          }}
          className="gap-1.5"
        >
          <Edit3 className="size-4" aria-hidden="true" />
          {contributeLabel}
        </Button>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("wikiContributeDialogTitle", { tagName })}
            </DialogTitle>
            <DialogDescription>
              {t("wikiContributeDialogDesc", {
                locale: locale.toUpperCase(),
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="wiki-lead-summary">{t("leadSummary")}</Label>
              <Textarea
                id="wiki-lead-summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t("leadSummaryPlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wiki-html-body">{t("articleContent")}</Label>
              <TiptapEditor
                value={body}
                onChange={setBody}
                placeholder={t("articleContentPlaceholder")}
                disabled={submitMutation.isPending}
                minHeight="200px"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wiki-change-note">
                {t("revisionSummaryNote")}
              </Label>
              <Input
                id="wiki-change-note"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder={t("revisionNotePlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("wikiCancel")}
            </Button>
            <Button
              disabled={
                submitMutation.isPending || !summary.trim() || !body.trim()
              }
              onClick={() => submitMutation.mutate()}
              className="gap-1.5"
            >
              <Send className="size-4" aria-hidden="true" />
              {submitMutation.isPending
                ? t("wikiPublishingBtn")
                : t("wikiPublishBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
