import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Clapperboard,
  EyeOff,
  Flame,
  GitBranch,
  Layers,
  Paintbrush,
  Search,
  Sparkles,
  Tag as TagIcon,
  User,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { BooleanTagSearchBar } from "@/components/tags/boolean-tag-search-bar";
import { CollaborativeTagBar } from "@/components/tags/collaborative-tag-bar";
import { TagCategoryEmblem } from "@/components/tags/tag-category-emblem";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import {
  getTagCategoryI18nKey,
  getTagCategoryToken,
} from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import {
  fetchBooleanTagSearchSSR,
  fetchPublicTagsDirectory,
  fetchTrendingTags,
  type TagCategory,
} from "@/services/tags";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    expand?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tags" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

async function TrendingTagsStrip({
  locale,
  title,
  hotLabel,
}: {
  locale: string;
  title: string;
  hotLabel: string;
}) {
  const trending = await fetchTrendingTags(locale, 12);
  if (trending.length === 0) return null;

  return (
    <div className="border-border/80 bg-card/70 rounded-2xl border p-4 shadow-xs backdrop-blur-xs sm:p-5">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 shadow-2xs dark:text-amber-400">
            <Flame className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
              {title}
            </h3>
            <p className="text-muted-foreground text-[11px]">{hotLabel}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {trending.map((tag, idx) => (
          <div key={tag.id} className="relative flex items-center">
            {idx < 3 && (
              <span className="z-10 -mr-1.5 flex size-4 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[9px] font-bold text-amber-700 dark:text-amber-300">
                {idx + 1}
              </span>
            )}
            <TagHoverCard
              locale={locale}
              slug={tag.slug}
              name={tag.name}
              translatedName={tag.translatedName}
              featuredImageUrl={tag.featuredImageUrl}
              category={tag.category}
              isOfficial={tag.isOfficial}
              usageCount={tag.usageCount}
              showWikiLink
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_ITEMS: {
  key: "all" | TagCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", labelKey: "categoryAll", icon: Sparkles },
  { key: "copyright", labelKey: "categoryCopyright", icon: Clapperboard },
  { key: "character", labelKey: "categoryCharacter", icon: User },
  { key: "artist", labelKey: "categoryArtist", icon: Paintbrush },
  { key: "general", labelKey: "categoryGeneral", icon: TagIcon },
  { key: "meta", labelKey: "categoryMeta", icon: Layers },
  { key: "system", labelKey: "categorySystem", icon: BadgeCheck },
];

function DirectoryPagination({
  currentPage,
  totalPages,
  buildUrl,
}: {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <Pagination className="pt-8">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(currentPage - 1)} />
          </PaginationItem>
        )}
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href={buildUrl(p)} isActive={p === currentPage}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export default async function TagsDiscoveryHubPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Tags" });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const activeQuery = sp.q?.trim() || "";
  const activeCategory = sp.category || "all";
  const expandHierarchy = sp.expand !== "false";
  const currentPage = Math.max(Number(sp.page) || 1, 1);

  const [directory, booleanResults] = await Promise.all([
    fetchPublicTagsDirectory({
      locale,
      category: activeCategory,
      page: currentPage,
      limit: 24,
    }),
    activeQuery
      ? fetchBooleanTagSearchSSR({
          tagQuery: activeQuery,
          locale,
          expandHierarchy,
          page: currentPage,
          limit: 12,
          accessToken,
        })
      : Promise.resolve(null),
  ]);

  const buildPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (activeCategory && activeCategory !== "all") {
      p.set("category", activeCategory);
    }
    if (activeQuery) {
      p.set("q", activeQuery);
    }
    if (!expandHierarchy) {
      p.set("expand", "false");
    }
    if (pageNumber > 1) {
      p.set("page", String(pageNumber));
    }
    const qs = p.toString();
    return qs ? `/tags?${qs}` : "/tags";
  };

  return (
    <Layout>
      <Header />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
        {/* Creative Discovery Hero Section */}
        <section className="border-border/70 from-card via-card/90 to-muted/20 relative z-20 overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-sm sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            aria-hidden="true"
          >
            <div className="bg-primary/10 absolute top-0 right-1/4 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl space-y-4 text-center">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-foreground gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs"
            >
              <Sparkles className="text-primary size-3.5" aria-hidden="true" />
              {t("hubBadge")}
            </Badge>

            <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {t("hubTitle")}
            </h1>

            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
              {t("hubSubtitle")}
            </p>
          </div>

          <div className="relative z-30 mt-8">
            <BooleanTagSearchBar
              initialQuery={activeQuery}
              locale={locale}
              expandHierarchy={expandHierarchy}
            />
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/dic"
              className="bg-card/90 hover:border-primary/40 hover:bg-card text-foreground border-border/80 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-semibold shadow-2xs transition-all hover:scale-[1.02] hover:shadow-xs active:scale-[0.98]"
            >
              <BookOpenText
                className="text-primary size-3.5"
                aria-hidden="true"
              />
              {t("readEncyclopedia")}
            </Link>
            <Link
              href="/settings/muted-tags"
              className="bg-card/90 text-muted-foreground hover:text-foreground hover:bg-card border-border/80 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <EyeOff className="size-3.5" aria-hidden="true" />
              {t("mutedSettingsTitle")}
            </Link>
          </div>
        </section>

        {/* Live Trending Tags Strip */}
        <Suspense
          fallback={
            <div className="flex flex-wrap gap-2 p-4">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-36 rounded-full" />
            </div>
          }
        >
          <TrendingTagsStrip
            locale={locale}
            title={t("trendingTitle")}
            hotLabel={t("hotTopics")}
          />
        </Suspense>

        {/* Active Boolean Evaluation Results */}
        {booleanResults && (
          <section className="bg-card/80 border-primary/25 space-y-6 rounded-3xl border p-5 shadow-sm backdrop-blur-xs sm:p-7">
            <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-foreground text-lg font-bold tracking-tight">
                    {t("searchResultsTitle")}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs tabular-nums"
                  >
                    {booleanResults.meta.total}{" "}
                    {t("worksCount", {
                      count: String(booleanResults.meta.total),
                    })}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>{t("queryLabel")}</span>
                  <code className="bg-muted text-foreground border-border/60 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold">
                    {activeQuery}
                  </code>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                    <GitBranch
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    {t("expandHierarchy")}:{" "}
                    <span
                      className={
                        expandHierarchy
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }
                    >
                      {expandHierarchy ? "ON" : "OFF"}
                    </span>
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl font-medium"
              >
                <Link
                  href={`/tags?q=${encodeURIComponent(activeQuery)}&expand=${
                    expandHierarchy ? "false" : "true"
                  }`}
                >
                  {expandHierarchy ? t("toggleExact") : t("expandHierarchy")}
                </Link>
              </Button>
            </div>

            {/* Resolved Canonical & Descendant Tag Cluster */}
            <div className="space-y-2.5">
              <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                {t("resolvedCluster", {
                  count: String(booleanResults.matchedTags.length),
                })}
              </p>
              {booleanResults.matchedTags.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  {t("noClusterMatches")}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {booleanResults.matchedTags.map((tag) => (
                    <TagHoverCard
                      key={tag.id}
                      locale={locale}
                      slug={tag.slug}
                      name={tag.name}
                      translatedName={tag.translatedName}
                      featuredImageUrl={tag.featuredImageUrl}
                      category={tag.category}
                      isOfficial={tag.isOfficial}
                      usageCount={tag.usageCount}
                      showWikiLink
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Matched Polymorphic Tagged Entities */}
            {booleanResults.data.length > 0 ? (
              <div className="border-border/70 space-y-3.5 border-t pt-5">
                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  {t("taggedWorks")} ({booleanResults.meta.total})
                </p>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {booleanResults.data.map((entry) => (
                    <Card
                      key={`${entry.entityType}-${entry.entityId}`}
                      className="group border-border/80 hover:border-primary/40 rounded-2xl shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/30 bg-primary/5 font-mono text-[10px] font-semibold uppercase"
                          >
                            {entry.entityType}
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            #{entry.entityId}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.map((et) => (
                            <TagHoverCard
                              key={et.id}
                              locale={locale}
                              slug={et.slug}
                              name={et.name}
                              translatedName={et.translatedName}
                              category={et.category}
                              isAuthorTag={et.isAuthorTag}
                              locked={et.locked}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Empty className="py-8">
                <EmptyMedia variant="icon">
                  <Search className="size-5" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-base">
                    {t("noContentFound")}
                  </EmptyTitle>
                  <EmptyDescription className="text-xs">
                    No artworks or works match the active boolean query. Try
                    broadening your tag search or disabling exact mode.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </section>
        )}

        {/* Canonical Tag Directory Hub */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-foreground text-2xl font-extrabold tracking-tight">
                {t("directoryTitle")}
              </h2>
              <p className="text-muted-foreground text-xs">
                {t("categoriesTitle")} ·{" "}
                <span className="text-foreground font-semibold">
                  {directory.meta.totalItems.toLocaleString()}
                </span>{" "}
                {t("canonicalTag").toLowerCase()}
              </p>
            </div>

            {/* Semantic Category Navigation Bar */}
            <nav
              aria-label="Filter tags by semantic category"
              className="flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {CATEGORY_ITEMS.map((cat) => {
                const isActive = activeCategory === cat.key;
                const href =
                  cat.key === "all" ? "/tags" : `/tags?category=${cat.key}`;
                const Icon = cat.icon;

                return (
                  <Link
                    key={cat.key}
                    href={href}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/60"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{t(cat.labelKey as any)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {directory.data.length === 0 ? (
            <Empty className="border-border/80 rounded-3xl border border-dashed py-12">
              <EmptyMedia variant="icon">
                <TagIcon className="size-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-base">
                  {t("noTagsFound")}
                </EmptyTitle>
                <EmptyDescription className="text-xs">
                  No canonical tags in category &quot;{activeCategory}&quot;.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {directory.data.map((tag) => {
                const token = getTagCategoryToken(tag.category);
                const display = tag.translatedName?.trim() || tag.name;

                return (
                  <div
                    key={tag.id}
                    className="group border-border/70 bg-card hover:border-primary/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      {/* Visual Header Banner */}
                      {tag.featuredImageUrl ? (
                        <Link
                          href={`/dic/${tag.slug}`}
                          className="bg-muted/30 border-border/50 relative block aspect-[16/9] w-full overflow-hidden border-b"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tag.featuredImageUrl}
                            alt={display}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${token.badge}`}
                            >
                              {t(getTagCategoryI18nKey(tag.category))}
                            </span>
                          </div>
                          <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-2xs backdrop-blur-xs">
                            <BookOpenText
                              className="text-primary size-3"
                              aria-hidden="true"
                            />
                            dic
                          </span>
                        </Link>
                      ) : (
                        <Link
                          href={`/dic/${tag.slug}`}
                          className={`border-border/50 relative block aspect-[16/9] w-full overflow-hidden border-b bg-gradient-to-br ${token.gradient} transition-transform duration-300`}
                        >
                          {/* Subtle ambient blur */}
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-2xs backdrop-blur-md ${token.badge}`}
                            >
                              {t(getTagCategoryI18nKey(tag.category))}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="text-muted-foreground bg-background/80 border-border/40 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums backdrop-blur-xs">
                              {t("worksCount", {
                                count: tag.usageCount.toLocaleString(),
                              })}
                            </span>
                          </div>

                          {/* Center Category Visual Emblem & Micro Identity */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                            <div className="bg-background/90 border-border/70 flex size-12 items-center justify-center rounded-2xl border shadow-xs backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                              <TagCategoryEmblem category={tag.category} />
                            </div>
                            <span className="text-foreground line-clamp-1 max-w-[85%] text-xs font-bold tracking-tight">
                              #{display}
                            </span>
                          </div>

                          {/* Bottom Right dic link pill */}
                          <span className="bg-background/80 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-2xs backdrop-blur-xs">
                            <BookOpenText
                              className="text-primary size-3"
                              aria-hidden="true"
                            />
                            dic
                          </span>
                        </Link>
                      )}

                      {/* Card Header Body */}
                      <div className="space-y-2 p-5 pb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono text-xs font-medium tabular-nums">
                            {t("worksCount", {
                              count: tag.usageCount.toLocaleString(),
                            })}
                          </span>
                          {tag.trendingScore > 0 && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-600 tabular-nums dark:text-amber-400">
                              <Flame className="size-3" aria-hidden="true" />
                              {tag.trendingScore.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Link
                            href={`/tags/${tag.slug}`}
                            className="text-foreground group-hover:text-primary flex items-center gap-1.5 text-lg font-bold tracking-tight transition-colors"
                          >
                            <span className="truncate">#{display}</span>
                            {tag.isOfficial && (
                              <BadgeCheck
                                className="text-primary size-4 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </Link>

                          {tag.translatedName &&
                            tag.translatedName.trim() !== tag.name.trim() && (
                              <p className="text-muted-foreground truncate font-mono text-xs">
                                #{tag.name}
                              </p>
                            )}
                        </div>

                        <p className="text-muted-foreground line-clamp-2 min-h-9 text-xs leading-relaxed text-pretty">
                          {tag.shortSummary ||
                            "Canonical taxonomy node with orthographic alias resolution and DAG closure indexing."}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="border-border/60 bg-muted/20 flex items-center justify-between border-t px-5 py-3 text-xs font-medium">
                      <Link
                        href={`/tags/${tag.slug}`}
                        className="text-foreground hover:text-primary inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>{t("viewTaggedWorks")}</span>
                        <ArrowRight
                          className="size-3 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>

                      <Link
                        href={`/dic/${tag.slug}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium transition-colors"
                      >
                        <BookOpenText className="size-3.5" aria-hidden="true" />
                        <span>dic</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Directory Pagination */}
          <DirectoryPagination
            currentPage={currentPage}
            totalPages={directory.meta.totalPages}
            buildUrl={buildPageUrl}
          />
        </section>

        {/* Collaborative Community Sandbox */}
        <section className="border-border/80 space-y-4 border-t pt-10">
          <div className="space-y-1">
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              {t("sandboxTitle")}
            </h2>
            <p className="text-muted-foreground text-xs text-pretty">
              {t("sandboxDesc")}
            </p>
          </div>
          <CollaborativeTagBar
            entityType="artwork"
            entityId="1"
            locale={locale}
          />
        </section>
      </main>
      <Footer />
    </Layout>
  );
}
