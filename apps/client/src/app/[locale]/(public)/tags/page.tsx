import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  BookOpenText,
  EyeOff,
  Flame,
  GitBranch,
  Sparkles,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}: {
  locale: string;
  title: string;
}) {
  const trending = await fetchTrendingTags(locale, 12);
  if (trending.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        <Flame className="size-3.5 text-amber-500" aria-hidden="true" />
        <span>{title}</span>
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

const CATEGORY_FILTERS: { key: "all" | TagCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "copyright", label: "Copyright / Series" },
  { key: "character", label: "Character" },
  { key: "artist", label: "Artist" },
  { key: "general", label: "General" },
  { key: "meta", label: "Meta" },
  { key: "system", label: "System" },
];

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

  return (
    <Layout>
      <Header />
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6 md:py-14">
        {/* Swiss Hero & Boolean Search */}
        <section className="space-y-6 text-center">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="text-primary size-3.5" aria-hidden="true" />
              {t("hubBadge")}
            </Badge>
            <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t("hubTitle")}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
              {t("hubSubtitle")}
            </p>
          </div>

          <BooleanTagSearchBar
            initialQuery={activeQuery}
            locale={locale}
            expandHierarchy={expandHierarchy}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
            <Link
              href="/dic"
              className="text-foreground hover:border-primary/40 bg-card inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium transition-colors"
            >
              <BookOpenText
                className="text-primary size-3.5"
                aria-hidden="true"
              />
              {t("readEncyclopedia")}
            </Link>
            <Link
              href="/settings/muted-tags"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors"
            >
              <EyeOff className="size-3.5" aria-hidden="true" />
              {t("mutedSettingsTitle")}
            </Link>
          </div>
        </section>

        {/* Streaming Trending Strip */}
        <Suspense
          fallback={
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-36 rounded-full" />
            </div>
          }
        >
          <TrendingTagsStrip locale={locale} title={t("trendingTitle")} />
        </Suspense>

        {/* Active Boolean Expression Evaluation Results */}
        {booleanResults && (
          <section className="bg-muted/20 space-y-5 rounded-2xl border p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  {t("searchResultsTitle")}
                </h2>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>Query:</span>
                  <code className="bg-background rounded border px-1.5 py-0.5 font-mono">
                    {activeQuery}
                  </code>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="size-3.5" aria-hidden="true" />
                    DAG Sub-Tag Expansion: {expandHierarchy ? "ON" : "OFF"}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/tags?q=${encodeURIComponent(activeQuery)}&expand=${
                    expandHierarchy ? "false" : "true"
                  }`}
                >
                  {expandHierarchy ? "Exact Tags Only" : t("expandHierarchy")}
                </Link>
              </Button>
            </div>

            {/* Matched Canonical & Descendant Tag Cluster */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Resolved Canonical & Descendant Cluster (
                {booleanResults.matchedTags.length})
              </p>
              {booleanResults.matchedTags.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  No canonical tags matched this boolean expression (or they are
                  hidden by your NG mute filter).
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
              <div className="space-y-3 border-t pt-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Matched Tagged Items ({booleanResults.meta.total})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {booleanResults.data.map((entry) => (
                    <Card
                      key={`${entry.entityType}-${entry.entityId}`}
                      className="shadow-2xs"
                    >
                      <CardContent className="space-y-2.5 p-4">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] uppercase"
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

        {/* Canonical Tag Directory */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              {t("directoryTitle")}
            </h2>

            <nav
              aria-label="Filter tags by semantic category"
              className="flex flex-wrap items-center gap-1.5"
            >
              {CATEGORY_FILTERS.map((cat) => {
                const isActive = activeCategory === cat.key;
                const href =
                  cat.key === "all" ? "/tags" : `/tags?category=${cat.key}`;
                return (
                  <Link
                    key={cat.key}
                    href={href}
                    className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.key === "all" ? t("allCategories") : cat.label}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {directory.data.map((tag) => {
                const token = getTagCategoryToken(tag.category);
                const display = tag.translatedName?.trim() || tag.name;

                return (
                  <Card
                    key={tag.id}
                    className={`group hover:border-foreground/30 flex flex-col justify-between overflow-hidden shadow-2xs transition-colors ${
                      tag.featuredImageUrl ? "pt-0" : ""
                    }`}
                  >
                    <div>
                      {tag.featuredImageUrl && (
                        <Link
                          href={`/dic/${tag.slug}`}
                          className="bg-muted/20 relative block overflow-hidden border-b"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tag.featuredImageUrl}
                            alt={display}
                            className="aspect-[21/9] h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-2xs backdrop-blur-xs">
                            <BookOpenText
                              className="text-primary size-3"
                              aria-hidden="true"
                            />
                            dic
                          </span>
                        </Link>
                      )}

                      <CardHeader
                        className={`space-y-2 pb-2.5 ${
                          tag.featuredImageUrl ? "pt-4" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
                            <span
                              className={`size-2 rounded-full ${token.dot}`}
                              aria-hidden="true"
                            />
                            {token.label}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            {t("worksCount", {
                              count: tag.usageCount.toLocaleString(),
                            })}
                          </span>
                        </div>

                        <CardTitle className="flex items-center gap-1.5 text-base leading-snug">
                          <Link
                            href={`/tags/${tag.slug}`}
                            className="truncate hover:underline"
                          >
                            #{display}
                          </Link>
                          {tag.isOfficial && (
                            <BadgeCheck
                              className="text-primary size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </CardTitle>

                        {tag.translatedName &&
                          tag.translatedName.trim() !== tag.name.trim() && (
                            <p className="text-muted-foreground truncate font-mono text-xs">
                              #{tag.name}
                            </p>
                          )}
                      </CardHeader>
                    </div>

                    <CardContent className="space-y-3 pt-0">
                      <p className="text-muted-foreground line-clamp-2 min-h-8 text-xs leading-relaxed text-pretty">
                        {tag.shortSummary ||
                          "Canonical taxonomy node with orthographic alias resolution and DAG closure indexing."}
                      </p>

                      <div className="flex items-center justify-between border-t pt-2.5 text-xs font-medium">
                        <Link
                          href={`/tags/${tag.slug}`}
                          className="text-foreground/80 hover:text-foreground hover:underline"
                        >
                          {t("viewTaggedWorks")}
                        </Link>
                        <Link
                          href={`/dic/${tag.slug}`}
                          className="text-primary inline-flex items-center gap-1 hover:underline"
                        >
                          <BookOpenText
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          dic
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Standalone Pixiv Collaborative Folksonomy Sandbox */}
        <section className="space-y-3 border-t pt-8">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Interactive Pixiv Folksonomy Sandbox (10-Tag Cap &amp; Locks)
            </h2>
            <p className="text-muted-foreground text-xs text-pretty">
              Test collaborative community tagging, creator tag (*) protection,
              multilingual autocomplete, and audit history on a standalone
              artwork slot.
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
