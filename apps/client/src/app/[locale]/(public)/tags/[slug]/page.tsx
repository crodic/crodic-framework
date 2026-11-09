import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { DefinedTerm, WithContext } from "schema-dts";
import {
  ArrowDown,
  ArrowLeft,
  BadgeCheck,
  BookOpenText,
  Flame,
  GitBranch,
  Layers,
  Link2,
  Sparkles,
  Split,
  Tag as TagIcon,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { MuteTagButton } from "@/components/tags/mute-tag-button";
import { TagCopyButton } from "@/components/tags/tag-copy-button";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import {
  getTagCategoryI18nKey,
  getTagCategoryToken,
} from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Link } from "@/i18n/navigation";
import { fetchBooleanTagSearchSSR, fetchTagBySlugSSR } from "@/services/tags";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ expand?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = await fetchTagBySlugSSR(slug, locale);

  if (!tag) {
    return { title: "Tag Not Found" };
  }

  const canonicalSlug = tag.redirectSlug || tag.slug;
  const displayTitle = tag.translatedName || tag.name;

  return {
    title: `#${displayTitle} (${tag.name}) — Tags & Taxonomy`,
    description:
      tag.shortSummary ||
      `Explore works, parent-child DAG hierarchy, and encyclopedia entry for #${displayTitle}.`,
    alternates: {
      canonical: `/${locale}/tags/${canonicalSlug}`,
    },
  };
}

function WorksPagination({
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
    <Pagination className="pt-6">
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

export default async function TagDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Tags" });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const decodedSlug = decodeURIComponent(slug);
  const tag = await fetchTagBySlugSSR(decodedSlug, locale, accessToken);

  if (!tag) {
    notFound();
  }

  // SEO Canonicalization: 308 Permanent Redirect when accessed via alias or merged slug
  if (tag.redirectSlug && tag.redirectSlug !== decodedSlug) {
    permanentRedirect(
      `/${locale}/tags/${encodeURIComponent(tag.redirectSlug)}`
    );
  }

  const expandHierarchy = sp.expand !== "false";
  const currentPage = Math.max(Number(sp.page) || 1, 1);

  const taggedResults = await fetchBooleanTagSearchSSR({
    tagQuery: tag.slug,
    locale,
    expandHierarchy,
    page: currentPage,
    limit: 12,
    accessToken,
  });

  const displayTitle = tag.translatedName?.trim() || tag.name;
  const categoryToken = getTagCategoryToken(tag.category);

  const jsonLd: WithContext<DefinedTerm> = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: displayTitle,
    alternateName: tag.aliases?.map((a) => a.aliasName),
    description:
      tag.shortSummary ||
      `Canonical tag #${tag.name} in semantic category ${tag.category}.`,
    termCode: tag.slug,
  };

  const { parents, children, siblings, related, disambiguations } = tag.graph;
  const associativeTags = Array.from(
    new Map([...siblings, ...related].map((node) => [node.id, node])).values()
  );

  const buildPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (!expandHierarchy) {
      p.set("expand", "false");
    }
    if (pageNumber > 1) {
      p.set("page", String(pageNumber));
    }
    const qs = p.toString();
    return qs
      ? `/tags/${encodeURIComponent(tag.slug)}?${qs}`
      : `/tags/${encodeURIComponent(tag.slug)}`;
  };

  return (
    <Layout>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
        <div>
          <Link
            href="/tags"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t("allCanonicalTags")}
          </Link>
        </div>

        {/* Canonical Tag Hero Card */}
        <section className="border-border/70 bg-card relative overflow-hidden rounded-3xl border shadow-sm">
          {/* Subtle Ambient Glow */}
          <div
            className={`pointer-events-none absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-20 blur-3xl ${categoryToken.gradient}`}
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Left Content Area */}
            <div className="relative z-10 flex-1 space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase shadow-2xs backdrop-blur-md ${categoryToken.badge}`}
                >
                  <span
                    className={`size-2 rounded-full ${categoryToken.dot}`}
                    aria-hidden="true"
                  />
                  {t(getTagCategoryI18nKey(tag.category))}
                </span>

                {tag.isOfficial && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs font-semibold"
                  >
                    <BadgeCheck
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    {t("officialBadge")}
                  </Badge>
                )}

                <span className="text-muted-foreground font-mono text-xs font-semibold tabular-nums">
                  {t("worksCount", { count: tag.usageCount.toLocaleString() })}
                </span>

                {tag.trendingScore > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-600 tabular-nums dark:text-amber-400">
                    <Flame className="size-3.5" aria-hidden="true" />
                    {tag.trendingScore.toFixed(1)}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl">
                  #{displayTitle}
                </h1>

                {tag.translatedName &&
                  tag.translatedName.trim() !== tag.name.trim() && (
                    <p className="text-muted-foreground mt-1.5 font-mono text-sm">
                      {t("canonicalPrefix")}{" "}
                      <span className="text-foreground font-semibold">
                        #{tag.name}
                      </span>
                    </p>
                  )}
              </div>

              {tag.shortSummary ? (
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty">
                  {tag.shortSummary}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs italic">
                  {t("hoverCardDefaultSummary")}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Button
                  asChild
                  size="sm"
                  className="gap-1.5 rounded-xl font-semibold shadow-xs"
                >
                  <a href="#tagged-works-section">
                    <Sparkles className="size-4" aria-hidden="true" />
                    {t("exploreWorks")}
                  </a>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="gap-1.5 rounded-xl font-medium"
                >
                  <Link href={`/dic/${tag.slug}`}>
                    <BookOpenText
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    {t("readEncyclopedia")}
                  </Link>
                </Button>

                <TagCopyButton
                  tagName={displayTitle}
                  label={t("copyName") || "Copy Tag"}
                  copiedLabel={t("copied") || "Copied"}
                />

                <MuteTagButton
                  tagId={tag.id}
                  tagName={tag.name}
                  initialMuted={Boolean(tag.isMutedByCurrentUser)}
                  muteLabel={t("muteTag")}
                  unmuteLabel={t("unmuteTag")}
                />
              </div>

              {/* Aliases */}
              {tag.aliases && tag.aliases.length > 0 && (
                <div className="border-border/60 flex flex-wrap items-center gap-1.5 border-t pt-4 text-xs">
                  <span className="text-muted-foreground mr-1 font-semibold">
                    {t("aliases")}:
                  </span>
                  {tag.aliases.map((al) => (
                    <Badge
                      key={`alias-${al.id}`}
                      variant="secondary"
                      className="rounded-lg text-xs font-normal whitespace-nowrap"
                    >
                      {al.aliasName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right Visual Image Banner if present */}
            {tag.featuredImageUrl && (
              <div className="border-border/60 relative w-full border-t md:w-80 md:border-t-0 md:border-l">
                <Link
                  href={`/dic/${tag.slug}`}
                  className="group bg-muted/20 relative block h-full min-h-[220px] w-full overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tag.featuredImageUrl}
                    alt={displayTitle}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                  <span className="bg-background/90 text-foreground absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs backdrop-blur-xs">
                    <BookOpenText
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    dic Wiki
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Semantic DAG Hierarchy Section */}
        <section
          aria-label="Semantic DAG tag relationships"
          className="space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
              <GitBranch className="text-primary size-5" aria-hidden="true" />
              {t("hierarchyVisual")}
            </h2>
            <p className="text-muted-foreground text-xs">
              Direct acyclic graph connections, category ancestors, and
              associative concepts.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Visual DAG 3-Tier Tree */}
            <div className="space-y-3">
              {/* Tier 1: Parents */}
              <Card className="border-border/70 rounded-2xl shadow-2xs">
                <CardHeader className="pb-2.5">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                    {t("parentConcepts")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parents.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      {t("rootNodeNotice")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {parents.map((p) => (
                        <TagHoverCard
                          key={`parent-${p.id}`}
                          locale={locale}
                          slug={p.slug}
                          name={p.name}
                          translatedName={p.translatedName}
                          category={p.category}
                          usageCount={p.usageCount}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connector: Parent -> Current */}
              <div
                className="my-1 flex items-center justify-center gap-2"
                aria-hidden="true"
              >
                <div className="bg-border h-px w-12" />
                <span className="text-muted-foreground bg-muted/70 border-border/60 inline-flex items-center gap-1 rounded-full border px-3 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                  <ArrowDown className="text-primary size-3" />
                  {t("parentConceptBadge")}
                </span>
                <div className="bg-border h-px w-12" />
              </div>

              {/* Tier 2: Current Focused Tag */}
              <Card className="border-primary/50 bg-primary/5 ring-primary/20 relative overflow-hidden rounded-2xl shadow-xs ring-2">
                <div className="bg-primary/10 pointer-events-none absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full blur-xl" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-[10px] font-bold tracking-wider uppercase">
                      {t("canonicalTag")}
                    </span>
                    <span className="bg-primary flex h-2 w-2 animate-pulse rounded-full" />
                  </div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>#{displayTitle}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${categoryToken.badge}`}
                    >
                      {t(getTagCategoryI18nKey(tag.category))}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-xs">
                  Slug:{" "}
                  <code className="text-foreground font-mono font-semibold">
                    /{tag.slug}
                  </code>{" "}
                  ·{" "}
                  <span className="text-foreground font-mono font-semibold tabular-nums">
                    {t("worksCount", {
                      count: tag.usageCount.toLocaleString(),
                    })}
                  </span>
                </CardContent>
              </Card>

              {/* Connector: Current -> Children */}
              <div
                className="my-1 flex items-center justify-center gap-2"
                aria-hidden="true"
              >
                <div className="bg-border h-px w-12" />
                <span className="text-muted-foreground bg-muted/70 border-border/60 inline-flex items-center gap-1 rounded-full border px-3 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                  <ArrowDown className="text-primary size-3" />
                  {t("subConceptBadge")}
                </span>
                <div className="bg-border h-px w-12" />
              </div>

              {/* Tier 3: Children */}
              <Card className="border-border/70 rounded-2xl shadow-2xs">
                <CardHeader className="pb-2.5">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                    {t("childSubTags")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {children.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      {t("leafNodeNotice")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {children.map((c) => (
                        <TagHoverCard
                          key={`child-${c.id}`}
                          locale={locale}
                          slug={c.slug}
                          name={c.name}
                          translatedName={c.translatedName}
                          category={c.category}
                          usageCount={c.usageCount}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Associative / Sibling / Disambiguation Side Panel */}
            <div className="space-y-4">
              <Card className="border-border/70 rounded-2xl shadow-2xs">
                <CardHeader className="pb-2.5">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                    <Link2
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    {t("siblingRelated")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {associativeTags.length === 0 &&
                  disambiguations.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      {t("noAssociativeNotice")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {associativeTags.map((node) => (
                        <TagHoverCard
                          key={`assoc-${node.id}`}
                          locale={locale}
                          slug={node.slug}
                          name={node.name}
                          translatedName={node.translatedName}
                          category={node.category}
                        />
                      ))}
                      {disambiguations.map((dis) => (
                        <Badge
                          key={`dis-${dis.id}`}
                          variant="outline"
                          className="gap-1 rounded-lg text-xs"
                        >
                          <Split
                            className="size-3 text-amber-500"
                            aria-hidden="true"
                          />
                          <Link
                            href={`/tags/${dis.slug}`}
                            className="hover:underline"
                          >
                            #{dis.translatedName || dis.name}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tagged Works Section */}
        <section
          id="tagged-works-section"
          className="border-border/80 space-y-5 border-t pt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                {t("exploreWorks")}
              </h2>
              <p className="text-muted-foreground text-xs">
                {t("worksCount", {
                  count: taggedResults.meta.total.toLocaleString(),
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl font-medium"
            >
              <Link
                href={`/tags/${encodeURIComponent(tag.slug)}?expand=${
                  expandHierarchy ? "false" : "true"
                }`}
              >
                {expandHierarchy
                  ? t("showingWithSubTags")
                  : t("showingExactOnly")}
              </Link>
            </Button>
          </div>

          {taggedResults.data.length === 0 ? (
            <Empty className="border-border/80 rounded-2xl border border-dashed py-12">
              <EmptyMedia variant="icon">
                <Layers className="size-5" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-base">
                  {t("noContentFound")}
                </EmptyTitle>
                <EmptyDescription className="text-xs">
                  No artworks or entries found with tag #{displayTitle}.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {taggedResults.data.map((entry) => (
                <Card
                  key={`${entry.entityType}-${entry.entityId}`}
                  className="group border-border/70 hover:border-primary/40 rounded-2xl shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
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
          )}

          {/* Works Pagination */}
          <WorksPagination
            currentPage={currentPage}
            totalPages={taggedResults.meta.totalPages}
            buildUrl={buildPageUrl}
          />
        </section>
      </main>
      <Footer />
    </Layout>
  );
}
