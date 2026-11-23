"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  Eye,
  History,
  Lock,
  Sparkles,
  Unlock,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { TagEncyclopediaResDto } from "@/services/tags";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityEditDialog } from "./community-edit-dialog";

interface TagEncyclopediaViewProps {
  tagId: string;
  tagName: string;
  wiki: TagEncyclopediaResDto | null;
}

function isHtmlEmpty(html?: string | null): boolean {
  if (!html) return true;
  if (/<(img|iframe|video|audio|picture|svg|hr|table)[^>]*>/i.test(html)) {
    return false;
  }
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0
  );
}

export function TagEncyclopediaView({
  tagId,
  tagName,
  wiki,
}: TagEncyclopediaViewProps) {
  const t = useTranslations("Tags");

  if (!wiki) {
    return (
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center sm:p-12">
          <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
            <BookOpen className="size-7" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-foreground text-base font-bold">
              {t("noWiki")}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("noWikiDesc")}
            </p>
          </div>
          <CommunityEditDialog
            tagId={tagId}
            tagName={tagName}
            currentWiki={null}
          />
        </CardContent>
      </Card>
    );
  }

  const formattedDate = wiki.updatedAt
    ? new Date(wiki.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      {/* 1. Optional Hero Featured Art Banner */}
      {wiki.featuredImageUrl && (
        <div className="border-border/70 bg-muted/40 relative aspect-[21/9] w-full overflow-hidden rounded-2xl border shadow-xs sm:aspect-[24/9]">
          <Image
            src={wiki.featuredImageUrl}
            alt={tagName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover object-center"
          />
        </div>
      )}

      {/* 2. Opening Definition Callout Box */}
      {wiki.summary && (
        <div className="border-border/80 bg-muted/30 relative overflow-hidden rounded-2xl border p-5 shadow-2xs sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-foreground text-sm leading-relaxed font-semibold">
                {wiki.summary}
              </p>
              <span className="text-muted-foreground font-mono text-[11px]">
                — Định nghĩa bách khoa toàn thư
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Rich Wiki Article Body */}
      {!isHtmlEmpty(wiki.body) ? (
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-5 sm:p-7">
            <div
              className="prose prose-sm dark:prose-invert text-foreground/90 [&_h2]:border-border/50 [&_a]:text-primary max-w-none leading-relaxed font-normal [&_a]:underline [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:border-b [&_h2]:pb-1.5 [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_li]:text-xs [&_p]:text-xs [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: wiki.body }}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* 4. Article Governance & Revision Footer */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-2xl border p-4 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground flex flex-wrap items-center gap-3">
          {/* Revision tag */}
          <div className="flex items-center gap-1.5 font-mono">
            <History className="text-primary size-3.5" />
            <span className="text-foreground font-bold">
              v{wiki.currentRevision}
            </span>
          </div>

          <span className="text-muted-foreground/40">•</span>

          {/* View count */}
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-violet-500" />
            <span className="text-foreground font-semibold tabular-nums">
              {t("viewsCount", { count: wiki.viewCount.toLocaleString() })}
            </span>
          </div>

          {formattedDate && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="text-muted-foreground size-3.5" />
                <span>{t("lastUpdated", { date: formattedDate })}</span>
              </div>
            </>
          )}

          <span className="text-muted-foreground/40">•</span>

          {/* Edit Lock Status */}
          {wiki.isEditLocked ? (
            <div
              className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"
              title={t("lockedWikiDesc")}
            >
              <Lock className="size-3.5" />
              <span>{t("lockedWiki")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <Unlock className="size-3.5" />
              <span>Mở đóng góp cộng đồng</span>
            </div>
          )}
        </div>

        {/* Community Edit Button (only if not locked) */}
        {!wiki.isEditLocked && (
          <CommunityEditDialog
            tagId={tagId}
            tagName={tagName}
            currentWiki={wiki}
          />
        )}
      </div>
    </div>
  );
}
