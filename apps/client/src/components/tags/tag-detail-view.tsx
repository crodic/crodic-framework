"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  BadgeCheck,
  BookOpen,
  Eye,
  GitBranch,
  Image as ImageIcon,
  Search,
  Share2,
  ShieldBan,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  muteTag,
  unmuteTag,
  type TagDetailResDto,
  type TagEncyclopediaResDto,
} from "@/services/tags";
import { TagCategoryBadge } from "./tag-category-badge";
import { TagSafetyBadge } from "./tag-safety-badge";
import { TagEncyclopediaView } from "./tag-encyclopedia-view";
import { TagArtworksGrid } from "./tag-artworks-grid";
import { TagHierarchyTree } from "./tag-hierarchy-tree";
import { TagHoverCard } from "./tag-hover-card";
import { useAuthStore } from "@/store/use-auth-store";

interface TagDetailViewProps {
  tag: TagDetailResDto;
  wiki: TagEncyclopediaResDto | null;
}

export function TagDetailView({ tag, wiki }: TagDetailViewProps) {
  const t = useTranslations("Tags");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const initialTab = searchParams.get("tab") || "wiki";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMuted, setIsMuted] = useState(tag.isMutedByCurrentUser ?? false);

  const muteMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng ẩn tag.");
        return;
      }
      if (isMuted) {
        await unmuteTag(tag.id);
        setIsMuted(false);
        toast.success(t("mute.unmutedSuccess", { tag: tag.name }));
      } else {
        await muteTag(tag.id);
        setIsMuted(true);
        toast.success(t("mute.mutedSuccess", { tag: tag.name }));
      }
      queryClient.invalidateQueries({ queryKey: ["tag-detail", tag.slug] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại!"
      );
    },
  });

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  const totalDagRelations =
    (tag.graph?.parents?.length || 0) +
    (tag.graph?.children?.length || 0) +
    (tag.graph?.related?.length || 0) +
    (tag.graph?.disambiguations?.length || 0);

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground flex items-center gap-1.5 text-xs"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/tags" className="hover:text-foreground transition-colors">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">#{tag.name}</span>
      </nav>

      {/* 2. Tag Hero Header Section */}
      <div className="border-border/70 bg-card relative overflow-hidden rounded-3xl border p-5 shadow-xs sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            {/* Title & Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                #{tag.name}
              </h1>

              {tag.isOfficial && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <BadgeCheck className="size-3.5" />
                  <span>{t("hoverTooltip.official")}</span>
                </span>
              )}

              <TagCategoryBadge category={tag.category} />

              {tag.safetyRating && tag.safetyRating !== "safe" && (
                <TagSafetyBadge safetyRating={tag.safetyRating} />
              )}
            </div>

            {/* Multilingual Translated Name */}
            {tag.translatedName && tag.translatedName !== tag.name && (
              <p className="text-muted-foreground text-sm font-medium">
                {tag.translatedName}
              </p>
            )}

            {/* Quick DAG Franchise Origin Chip */}
            {tag.graph?.parents && tag.graph.parents.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-medium">
                  {t("parentSeries")}:
                </span>
                {tag.graph.parents.map((p) => {
                  const pSlug = p.slug || encodeURIComponent(p.name);
                  return (
                    <TagHoverCard key={p.id} slugOrName={pSlug}>
                      <Link
                        href={`/tags/${pSlug}`}
                        className="bg-muted/60 border-border/70 hover:border-primary/50 hover:text-primary text-foreground inline-flex items-center gap-1 rounded-xl border px-2.5 py-0.5 font-semibold transition-colors"
                      >
                        <span className="text-primary/70">#</span>
                        <span>{p.name}</span>
                        {p.translatedName && p.translatedName !== p.name && (
                          <span className="text-muted-foreground text-[11px] font-normal">
                            ({p.translatedName})
                          </span>
                        )}
                      </Link>
                    </TagHoverCard>
                  );
                })}
              </div>
            )}

            {/* Aliases / Tên gọi khác */}
            {tag.aliases && tag.aliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-muted-foreground font-medium">
                  {t("aliases")}:
                </span>
                {tag.aliases.map((al) => (
                  <span
                    key={al.id}
                    className="bg-muted/40 border-border/60 text-muted-foreground rounded-lg border px-2 py-0.5 text-[11px]"
                  >
                    {al.aliasName}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="text-primary size-4" />
                <span className="text-foreground font-bold tabular-nums">
                  {tag.usageCount.toLocaleString()}
                </span>
                <span>{t("postsCount", { count: "" }).trim()}</span>
              </div>

              {wiki && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="size-4 text-violet-500" />
                    <span className="text-foreground font-bold tabular-nums">
                      {wiki.viewCount.toLocaleString()}
                    </span>
                    <span>{t("viewsCount", { count: "" }).trim()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
            >
              <Share2 className="size-3.5" />
              <span>Chia sẻ</span>
            </Button>

            <Button
              variant={isMuted ? "secondary" : "outline"}
              size="sm"
              onClick={() => muteMutation.mutate()}
              disabled={muteMutation.isPending}
              className="cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
            >
              <ShieldBan
                className={
                  isMuted
                    ? "size-3.5 text-rose-500"
                    : "text-muted-foreground size-3.5"
                }
              />
              <span>{isMuted ? t("mute.unmuteTag") : t("mute.muteTag")}</span>
            </Button>

            <Button
              asChild
              variant="default"
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Link href={`/explore?q=${encodeURIComponent(tag.name)}`}>
                <Search className="size-3.5" />
                <span>Tìm kiếm</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Main Multi-Tab Workspace */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          router.replace(
            `/tags/${tag.slug || encodeURIComponent(tag.name)}?tab=${val}`,
            {
              scroll: false,
            }
          );
        }}
        className="space-y-6"
      >
        <div className="w-full [scrollbar-width:none] overflow-x-auto">
          <TabsList className="bg-muted/60 border-border/60 h-10 min-w-full justify-start gap-1 rounded-2xl border p-1 sm:w-fit sm:justify-center">
            <TabsTrigger
              value="wiki"
              className="shrink-0 cursor-pointer gap-2 rounded-xl px-4 text-xs font-bold data-[state=active]:shadow-xs"
            >
              <BookOpen className="size-3.5" />
              <span>{t("tabWiki")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="artworks"
              className="shrink-0 cursor-pointer gap-2 rounded-xl px-4 text-xs font-bold data-[state=active]:shadow-xs"
            >
              <ImageIcon className="size-3.5" />
              <span>{t("tabArtworks")}</span>
              <span className="bg-muted text-muted-foreground py-0.2 rounded-full px-1.5 font-mono text-[10px] tabular-nums">
                {tag.usageCount.toLocaleString()}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="hierarchy"
              className="shrink-0 cursor-pointer gap-2 rounded-xl px-4 text-xs font-bold data-[state=active]:shadow-xs"
            >
              <GitBranch className="size-3.5" />
              <span>{t("tabHierarchy")}</span>
              {totalDagRelations > 0 && (
                <span className="bg-muted text-muted-foreground py-0.2 rounded-full px-1.5 font-mono text-[10px] tabular-nums">
                  {totalDagRelations}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Wiki Encyclopedia */}
        <TabsContent value="wiki" className="mt-0 space-y-6">
          <TagEncyclopediaView tagId={tag.id} tagName={tag.name} wiki={wiki} />
        </TabsContent>

        {/* Tab 2: Artworks & Photos Grid */}
        <TabsContent value="artworks" className="mt-0 space-y-6">
          <TagArtworksGrid tagName={tag.name} />
        </TabsContent>

        {/* Tab 3: Semantic DAG Hierarchy */}
        <TabsContent value="hierarchy" className="mt-0 space-y-6">
          <TagHierarchyTree graph={tag.graph} tagName={tag.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
