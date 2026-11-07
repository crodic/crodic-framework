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
  Sparkles,
  Tag as TagIcon,
  User,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { BooleanTagSearchBar } from "@/components/tags/boolean-tag-search-bar";
import { CollaborativeTagBar } from "@/components/tags/collaborative-tag-bar";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import { getTagCategoryToken } from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="border-border/80 bg-card/60 rounded-2xl border p-4 shadow-2xs backdrop-blur-xs sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
            <Flame className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
              {title}
            </h3>
            <p className="text-muted-foreground text-[11px]">{hotLabel}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {trending.map((tag) => (
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
        <section className="border-border/70 from-card via-card/90 to-muted/20 relative z-20 rounded-3xl border bg-gradient-to-b p-6 shadow-xs sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            aria-hidden="true"
          >
            <div className="bg-primary/5 absolute top-0 right-1/4 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl space-y-4 text-center">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-foreground gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
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

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/dic"
              className="bg-card hover:border-primary/40 text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium shadow-2xs transition-colors"
            >
              <BookOpenText
                className="text-primary size-3.5"
                aria-hidden="true"
              />
              {t("readEncyclopedia")}
            </Link>
            <Link
              href="/settings/muted-tags"
              className="bg-card text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors"
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
          <section className="bg-card/70 border-primary/20 space-y-6 rounded-2xl border p-5 shadow-xs backdrop-blur-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
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
                  <code className="bg-muted text-foreground rounded border px-2 py-0.5 font-mono text-xs font-semibold">
                    {activeQuery}
                  </code>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="size-3.5" aria-hidden="true" />
                    {t("expandHierarchy")}: {expandHierarchy ? "ON" : "OFF"}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
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
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
            {booleanResults.data.length > 0 && (
              <div className="space-y-3.5 border-t pt-5">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {t("taggedWorks")} ({booleanResults.meta.total})
                </p>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {booleanResults.data.map((entry) => (
                    <Card
                      key={`${entry.entityType}-${entry.entityId}`}
                      className="group border-border/80 hover:border-foreground/30 shadow-2xs transition-all hover:-translate-y-0.5"
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
            )}
          </section>
        )}

        {/* Canonical Tag Directory Hub */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                {t("directoryTitle")}
              </h2>
              <p className="text-muted-foreground text-xs">
                {t("categoriesTitle")} ·{" "}
                {directory.meta.totalItems.toLocaleString()}{" "}
                {t("canonicalTag").toLowerCase()}
              </p>
            </div>

            {/* Semantic Category Navigation Bar */}
            <nav
              aria-label="Filter tags by semantic category"
              className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1"
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/50"
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
            <div className="text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
              {t("noTagsFound")}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {directory.data.map((tag) => {
                const token = getTagCategoryToken(tag.category);
                const display = tag.translatedName?.trim() || tag.name;

                return (
                  <div
                    key={tag.id}
                    className="group border-border/70 bg-card hover:border-foreground/30 relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
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
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md ${token.badge}`}
                            >
                              {token.label}
                            </span>
                          </div>
                          <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-2xs backdrop-blur-xs">
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
                          {/* Decorative SVG Geometric Mesh / Dot Pattern */}
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                          {/* Large Artistic Watermark Hashtag */}
                          <div
                            className={`pointer-events-none absolute -right-2 -bottom-6 font-mono text-8xl font-black opacity-15 select-none ${token.accentColor}`}
                          >
                            #
                          </div>

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow-2xs backdrop-blur-md ${token.badge}`}
                            >
                              {token.label}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="text-muted-foreground bg-background/60 border-border/40 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums backdrop-blur-xs">
                              {t("worksCount", {
                                count: tag.usageCount.toLocaleString(),
                              })}
                            </span>
                          </div>

                          {/* Center Stylized Preview Title */}
                          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                            <span className="text-foreground/90 line-clamp-1 text-lg font-extrabold tracking-tight drop-shadow-xs transition-transform duration-200 group-hover:scale-105 sm:text-xl">
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
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-600 tabular-nums dark:text-amber-400">
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
                        className="text-foreground/90 hover:text-foreground inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>{t("viewTaggedWorks")}</span>
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>

                      <Link
                        href={`/dic/${tag.slug}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
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
